<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import clienteService from '../services/cliente.service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { useConfirm, useSuccess, useError } from '@/composables/useSwal'
import gsap from 'gsap'

const clientes = ref<any[]>([])
const showForm = ref(false)
const editing = ref<any | null>(null)
const form = ref({ nombre: '', email: '', telefono: '', direccion: '' })
const formErrors = ref<string[]>([])
const page = ref(1)
const perPage = 10

const totalPages = computed(() => Math.max(1, Math.ceil(clientes.value.length / perPage)))
const paginatedClientes = computed(() => {
  const start = (page.value - 1) * perPage
  return clientes.value.slice(start, start + perPage)
})

async function load() {
  try {
    const res = await clienteService.getAll()
    clientes.value = res.data
    if (page.value > totalPages.value) page.value = totalPages.value
  } catch {
    useError('Error', 'No se pudieron cargar los clientes')
  }
}

function openNew() {
  editing.value = null
  form.value = { nombre: '', email: '', telefono: '', direccion: '' }
  showForm.value = true
}

function openEdit(c: any) {
  editing.value = c
  form.value = { nombre: c.nombre, email: c.email ?? '', telefono: c.telefono ?? '', direccion: c.direccion ?? '' }
  showForm.value = true
}

function validate(): boolean {
  formErrors.value = []
  if (!form.value.nombre.trim()) formErrors.value.push('Nombre es requerido')
  return formErrors.value.length === 0
}

async function save() {
  if (!validate()) return
  try {
    if (editing.value) {
      await clienteService.update(editing.value.id_cliente, form.value)
      await useSuccess('Actualizado', 'El cliente se actualizo correctamente')
    } else {
      await clienteService.create(form.value)
      await useSuccess('Creado', 'El cliente se creo correctamente')
    }
    showForm.value = false
    await load()
  } catch (err: any) {
    useError('Error', err.response?.data?.error ?? 'Error al guardar cliente')
  }
}

async function remove(id: number) {
  const result = await useConfirm({
    title: 'Eliminar cliente?',
    text: 'Esta accion no se puede deshacer. Se eliminara el cliente permanentemente.',
    confirmText: 'Si, eliminar',
    icon: 'warning',
  })
  if (!result.isConfirmed) return
  try {
    await clienteService.remove(id)
    await useSuccess('Eliminado', 'El cliente fue eliminado correctamente')
    await load()
  } catch (err: any) {
    useError('Error', err.response?.data?.error ?? 'Error al eliminar cliente')
  }
}

onMounted(async () => {
  await load()
  gsap.from('.clientes-table tr', {
    y: 12,
    opacity: 0,
    duration: 0.2,
    stagger: 0.03,
    ease: 'power2.out',
  })
})
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <h1 class="text-2xl font-bold">Clientes</h1>
        <Badge variant="secondary" class="text-xs">{{ clientes.length }} total</Badge>
      </div>
      <Button class="gap-1.5 transition-all duration-200 hover:scale-105 hover:shadow-md hover:shadow-primary/20" @click="openNew">
        + Nuevo Cliente
      </Button>
    </div>

    <div class="rounded-lg border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow class="hover:bg-transparent">
            <TableHead class="w-16">ID</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Telefono</TableHead>
            <TableHead>Direccion</TableHead>
            <TableHead>Usuario</TableHead>
            <TableHead class="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody class="clientes-table">
          <TableRow v-for="c in paginatedClientes" :key="c.id_cliente" class="transition-colors duration-150 hover:bg-muted/50">
            <TableCell class="font-mono text-muted-foreground text-xs">{{ c.id_cliente }}</TableCell>
            <TableCell class="font-medium">{{ c.nombre }}</TableCell>
            <TableCell class="text-muted-foreground">{{ c.email ?? '-' }}</TableCell>
            <TableCell class="text-muted-foreground">{{ c.telefono ?? '-' }}</TableCell>
            <TableCell class="text-muted-foreground max-w-40 truncate">{{ c.direccion ?? '-' }}</TableCell>
            <TableCell class="text-muted-foreground">{{ c.username ?? '-' }}</TableCell>
            <TableCell class="text-right">
              <div class="flex items-center justify-end gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  class="h-7 px-2.5 text-xs transition-all duration-200 hover:border-primary/50 hover:text-primary hover:bg-primary/5"
                  @click="openEdit(c)"
                >
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  class="h-7 px-2.5 text-xs text-destructive border-destructive/30 transition-all duration-200 hover:bg-destructive hover:text-white hover:border-destructive hover:shadow-sm"
                  @click="remove(c.id_cliente)"
                >
                  Eliminar
                </Button>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
    <div class="mt-4 flex items-center justify-between">
      <p class="text-sm text-muted-foreground">Pagina {{ page }} de {{ totalPages }}</p>
      <div class="flex items-center gap-2">
        <Button variant="outline" size="sm" :disabled="page <= 1" @click="page--">Anterior</Button>
        <Button variant="outline" size="sm" :disabled="page >= totalPages" @click="page++">Siguiente</Button>
      </div>
    </div>

    <Dialog :open="showForm" @update:open="(v: boolean) => showForm = v">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{{ editing ? 'Editar' : 'Nuevo' }} Cliente</DialogTitle>
        </DialogHeader>
        <div v-if="formErrors.length" class="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive space-y-1">
          <div v-for="e in formErrors" :key="e">{{ e }}</div>
        </div>
        <form @submit.prevent="save" class="space-y-4">
          <div class="space-y-2">
            <Label>Nombre *</Label>
            <Input v-model="form.nombre" required />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label>Email</Label>
              <Input v-model="form.email" type="email" />
            </div>
            <div class="space-y-2">
              <Label>Telefono</Label>
              <Input v-model="form.telefono" />
            </div>
          </div>
          <div class="space-y-2">
            <Label>Direccion</Label>
            <Input v-model="form.direccion" />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" class="transition-all duration-200 hover:bg-muted" @click="showForm = false">Cancelar</Button>
            <Button type="submit" class="transition-all duration-200 hover:scale-105 hover:shadow-md">Guardar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>
