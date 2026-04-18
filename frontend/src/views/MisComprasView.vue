<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ventaService from '../services/venta.service'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { useError } from '@/composables/useSwal'
import gsap from 'gsap'

const compras = ref<any[]>([])
const loading = ref(true)

async function load() {
  try {
    const res = await ventaService.getMisCompras()
    compras.value = res.data
  } catch {
    useError('Error', 'No se pudieron cargar tus compras')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await load()
  gsap.from('.compra-card', {
    y: 20,
    opacity: 0,
    duration: 0.25,
    stagger: 0.05,
    ease: 'power2.out',
  })
})
</script>

<template>
  <div>
    <div class="flex items-center gap-3 mb-6">
      <h1 class="text-2xl font-bold">Mis Compras</h1>
      <Badge variant="secondary" class="text-xs">{{ compras.length }} compras</Badge>
    </div>

    <div v-if="loading" class="text-center py-16 text-muted-foreground">Cargando compras...</div>

    <div v-else-if="compras.length === 0" class="text-center py-16">
      <p class="text-5xl mb-4">🛒</p>
      <p class="text-lg text-muted-foreground">Aun no has realizado compras</p>
      <p class="text-sm text-muted-foreground mt-1">Visita el catalogo para encontrar productos</p>
    </div>

    <div v-else class="space-y-4">
      <Card
        v-for="c in compras"
        :key="c.id_venta"
        class="compra-card shadow-sm transition-all duration-250 hover:shadow-md hover:-translate-y-0.5"
      >
        <CardHeader class="pb-3">
          <div class="flex items-center justify-between">
            <CardTitle class="text-sm font-medium">
              Compra #{{ c.id_venta }}
            </CardTitle>
            <div class="flex items-center gap-3">
              <span class="text-xs text-muted-foreground">{{ new Date(c.fecha).toLocaleDateString('es-GT', { year: 'numeric', month: 'long', day: 'numeric' }) }}</span>
              <Badge variant="secondary" class="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                {{ c.estado }}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow class="hover:bg-transparent">
                <TableHead>Producto</TableHead>
                <TableHead class="text-center w-24">Cantidad</TableHead>
                <TableHead class="text-right">Precio Unit.</TableHead>
                <TableHead class="text-right">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="(d, i) in c.detalle" :key="i" class="transition-colors duration-150 hover:bg-muted/50">
                <TableCell class="font-medium">{{ d.producto }}</TableCell>
                <TableCell class="text-center">{{ d.cantidad }}</TableCell>
                <TableCell class="text-right font-mono">Q{{ Number(d.precio_unitario).toFixed(2) }}</TableCell>
                <TableCell class="text-right font-mono">Q{{ (d.cantidad * Number(d.precio_unitario)).toFixed(2) }}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <div class="text-right text-lg font-bold border-t pt-3 mt-2">
            Total: <span class="text-primary">Q{{ Number(c.total).toFixed(2) }}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
