<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import compraService from '@/services/compra.service'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { useError } from '@/composables/useSwal'
import gsap from 'gsap'

const router = useRouter()
const compras = ref<any[]>([])
const page = ref(1)
const perPage = 10

const totalPages = computed(() => Math.max(1, Math.ceil(compras.value.length / perPage)))
const paginatedCompras = computed(() => {
  const start = (page.value - 1) * perPage
  return compras.value.slice(start, start + perPage)
})

async function load() {
  try {
    const res = await compraService.getAll()
    compras.value = res.data
    if (page.value > totalPages.value) page.value = totalPages.value
  } catch {
    useError('Error', 'No se pudieron cargar las compras')
  }
}

function goToDetalle(id: number) {
  router.push(`/compras/${id}`)
}

onMounted(async () => {
  await load()
  gsap.from('.compras-table tr', {
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
    <div class="mb-6 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <h1 class="text-2xl font-bold">Compras a Proveedores</h1>
        <Badge variant="secondary" class="text-xs">{{ compras.length }} registradas</Badge>
      </div>
    </div>

    <Card class="shadow-sm">
      <CardHeader class="pb-3">
        <CardTitle class="text-sm font-medium uppercase tracking-wide text-muted-foreground">Listado de compras</CardTitle>
      </CardHeader>
      <CardContent class="pt-0">
        <Table>
          <TableHeader>
            <TableRow class="hover:bg-transparent">
              <TableHead class="w-16">ID</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Proveedor</TableHead>
              <TableHead class="text-right">Total</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead class="text-right">Accion</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody class="compras-table">
            <TableRow v-for="c in paginatedCompras" :key="c.id_compra" class="transition-colors duration-150 hover:bg-muted/50">
              <TableCell class="font-mono text-xs text-muted-foreground">{{ c.id_compra }}</TableCell>
              <TableCell>{{ new Date(c.fecha).toLocaleDateString('es-GT', { year: 'numeric', month: 'short', day: 'numeric' }) }}</TableCell>
              <TableCell class="font-medium">{{ c.proveedor }}</TableCell>
              <TableCell class="text-right font-mono font-medium">Q{{ Number(c.total).toFixed(2) }}</TableCell>
              <TableCell>
                <Badge :variant="c.estado === 'recibida' ? 'secondary' : 'outline'">{{ c.estado }}</Badge>
              </TableCell>
              <TableCell class="text-right">
                <Button
                  variant="outline"
                  size="sm"
                  class="h-7 px-2.5 text-xs transition-all duration-200 hover:border-primary/50 hover:text-primary hover:bg-primary/5"
                  @click="goToDetalle(c.id_compra)"
                >
                  Ver detalle
                </Button>
              </TableCell>
            </TableRow>
            <TableRow v-if="!paginatedCompras.length">
              <TableCell colspan="6" class="py-6 text-center text-muted-foreground">Sin compras registradas</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <div class="mt-4 flex items-center justify-between">
      <p class="text-sm text-muted-foreground">Pagina {{ page }} de {{ totalPages }}</p>
      <div class="flex items-center gap-2">
        <Button variant="outline" size="sm" :disabled="page <= 1" @click="page--">Anterior</Button>
        <Button variant="outline" size="sm" :disabled="page >= totalPages" @click="page++">Siguiente</Button>
      </div>
    </div>
  </div>
</template>
