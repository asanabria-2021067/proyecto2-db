<script setup lang="ts">
import { ref, onMounted } from 'vue'
import productoService from '../services/producto.service'
import ProductoForm from '../components/ProductoForm.vue'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { useConfirm, useSuccess, useError } from '@/composables/useSwal'
import gsap from 'gsap'

const productos = ref<any[]>([])
const showForm = ref(false)
const editing = ref<any | null>(null)

async function load() {
  try {
    const res = await productoService.getAll()
    productos.value = res.data
  } catch {
    useError('Error', 'No se pudieron cargar los productos')
  }
}

function openNew() {
  editing.value = null
  showForm.value = true
}

function openEdit(p: any) {
  editing.value = { ...p }
  showForm.value = true
}

async function save(data: any) {
  try {
    if (editing.value?.id_producto) {
      await productoService.update(editing.value.id_producto, data)
      await useSuccess('Actualizado', 'El producto se actualizo correctamente')
    } else {
      await productoService.create(data)
      await useSuccess('Creado', 'El producto se creo correctamente')
    }
    showForm.value = false
    await load()
  } catch (err: any) {
    useError('Error', err.response?.data?.error ?? 'Error al guardar producto')
  }
}

async function remove(id: number) {
  const result = await useConfirm({
    title: 'Eliminar producto?',
    text: 'Esta accion no se puede deshacer. Se eliminara el producto permanentemente.',
    confirmText: 'Si, eliminar',
    icon: 'warning',
  })
  if (!result.isConfirmed) return
  try {
    await productoService.remove(id)
    await useSuccess('Eliminado', 'El producto fue eliminado correctamente')
    await load()
  } catch (err: any) {
    useError('Error', err.response?.data?.error ?? 'Error al eliminar producto')
  }
}

onMounted(async () => {
  await load()
  gsap.from('.productos-table tr', {
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
        <h1 class="text-2xl font-bold">Productos</h1>
        <Badge variant="secondary" class="text-xs">{{ productos.length }} total</Badge>
      </div>
      <Button class="gap-1.5 transition-all duration-200 hover:scale-105 hover:shadow-md hover:shadow-primary/20" @click="openNew">
        + Nuevo Producto
      </Button>
    </div>

    <div class="rounded-lg border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow class="hover:bg-transparent">
            <TableHead class="w-16">ID</TableHead>
            <TableHead>Titulo</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Editorial</TableHead>
            <TableHead>Autores</TableHead>
            <TableHead class="text-right">Precio</TableHead>
            <TableHead class="text-right">Stock</TableHead>
            <TableHead class="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody class="productos-table">
          <TableRow v-for="p in productos" :key="p.id_producto" class="transition-colors duration-150 hover:bg-muted/50">
            <TableCell class="font-mono text-muted-foreground text-xs">{{ p.id_producto }}</TableCell>
            <TableCell class="font-medium">{{ p.titulo }}</TableCell>
            <TableCell>
              <Badge variant="secondary" class="mr-1">{{ p.tipo }}</Badge>
              <span class="text-sm text-muted-foreground">{{ p.categoria }}</span>
            </TableCell>
            <TableCell class="text-muted-foreground">{{ p.editorial }}</TableCell>
            <TableCell class="text-sm text-muted-foreground max-w-32 truncate">{{ p.autores ?? '-' }}</TableCell>
            <TableCell class="text-right font-mono font-medium">Q{{ Number(p.precio).toFixed(2) }}</TableCell>
            <TableCell class="text-right">
              <Badge :variant="p.stock <= 5 ? 'destructive' : 'outline'">{{ p.stock }}</Badge>
            </TableCell>
            <TableCell class="text-right">
              <div class="flex items-center justify-end gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  class="h-7 px-2.5 text-xs transition-all duration-200 hover:border-primary/50 hover:text-primary hover:bg-primary/5"
                  @click="openEdit(p)"
                >
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  class="h-7 px-2.5 text-xs text-destructive border-destructive/30 transition-all duration-200 hover:bg-destructive hover:text-white hover:border-destructive hover:shadow-sm"
                  @click="remove(p.id_producto)"
                >
                  Eliminar
                </Button>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <ProductoForm
      v-if="showForm"
      :producto="editing"
      @save="save"
      @cancel="showForm = false"
    />
  </div>
</template>
