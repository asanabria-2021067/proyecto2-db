<script setup lang="ts">
import { onMounted, ref } from 'vue'
import reporteService from '@/services/reporte.service'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { useError } from '@/composables/useSwal'
import gsap from 'gsap'

const productos = ref<any[]>([])
const loading = ref(true)

async function load() {
  try {
    const res = await reporteService.productosNoVendidos()
    productos.value = res.data
  } catch {
    useError('Error', 'No se pudieron cargar los productos no vendidos')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await load()
  gsap.from('.no-vendidos-table tr', {
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
    <div class="mb-6 flex items-center gap-3">
      <h1 class="text-2xl font-bold">Productos no vendidos</h1>
      <Badge variant="secondary" class="text-xs">{{ productos.length }} total</Badge>
    </div>

    <Card class="shadow-sm">
      <CardHeader class="pb-3">
        <CardTitle class="text-sm font-medium uppercase tracking-wide text-muted-foreground">Listado de productos</CardTitle>
      </CardHeader>
      <CardContent class="pt-0">
        <div v-if="loading" class="py-16 text-center text-muted-foreground">Cargando productos...</div>
        <Table v-else>
          <TableHeader>
            <TableRow class="hover:bg-transparent">
              <TableHead>Titulo</TableHead>
              <TableHead class="text-right">Precio</TableHead>
              <TableHead class="text-right">Stock</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody class="no-vendidos-table">
            <TableRow v-for="p in productos" :key="p.id_producto" class="transition-colors duration-150 hover:bg-muted/50">
              <TableCell class="font-medium">{{ p.titulo }}</TableCell>
              <TableCell class="text-right font-mono">Q{{ Number(p.precio).toFixed(2) }}</TableCell>
              <TableCell class="text-right">
                <Badge :variant="p.stock <= 5 ? 'destructive' : 'outline'">{{ p.stock }}</Badge>
              </TableCell>
            </TableRow>
            <TableRow v-if="!productos.length">
              <TableCell colspan="3" class="py-6 text-center text-muted-foreground">No hay productos en este reporte</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </div>
</template>
