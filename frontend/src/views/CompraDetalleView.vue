<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import compraService from '@/services/compra.service'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { useError } from '@/composables/useSwal'

const route = useRoute()
const router = useRouter()
const compra = ref<any | null>(null)
const detalle = ref<any[]>([])
const loading = ref(true)

async function load() {
  const id = Number(route.params.id)
  if (Number.isNaN(id)) {
    useError('Error', 'ID de compra invalido')
    router.push('/compras')
    return
  }

  try {
    const [detalleRes, comprasRes] = await Promise.all([
      compraService.getDetalle(id),
      compraService.getAll(),
    ])
    detalle.value = detalleRes.data
    compra.value = comprasRes.data.find((c: any) => c.id_compra === id) ?? null
  } catch {
    useError('Error', 'No se pudo cargar el detalle de compra')
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <h1 class="text-2xl font-bold">Detalle de Compra</h1>
        <Badge variant="secondary" class="text-xs">#{{ route.params.id }}</Badge>
      </div>
      <Button variant="outline" size="sm" @click="router.push('/compras')">Volver</Button>
    </div>

    <div v-if="loading" class="py-16 text-center text-muted-foreground">Cargando detalle...</div>

    <template v-else>
      <Card class="shadow-sm">
        <CardHeader class="pb-3">
          <CardTitle class="text-sm font-medium uppercase tracking-wide text-muted-foreground">Informacion general</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="grid gap-4 sm:grid-cols-3">
            <div>
              <p class="text-xs uppercase tracking-wide text-muted-foreground">Fecha</p>
              <p class="mt-1 font-medium">
                {{ compra?.fecha ? new Date(compra.fecha).toLocaleDateString('es-GT', { year: 'numeric', month: 'long', day: 'numeric' }) : '-' }}
              </p>
            </div>
            <div>
              <p class="text-xs uppercase tracking-wide text-muted-foreground">Proveedor</p>
              <p class="mt-1 font-medium">{{ compra?.proveedor ?? detalle[0]?.proveedor ?? '-' }}</p>
            </div>
            <div>
              <p class="text-xs uppercase tracking-wide text-muted-foreground">Estado</p>
              <Badge class="mt-1" :variant="compra?.estado === 'recibida' ? 'secondary' : 'outline'">{{ compra?.estado ?? '-' }}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card class="shadow-sm">
        <CardHeader class="pb-3">
          <CardTitle class="text-sm font-medium uppercase tracking-wide text-muted-foreground">Items de la compra</CardTitle>
        </CardHeader>
        <CardContent class="pt-0">
          <Table>
            <TableHeader>
              <TableRow class="hover:bg-transparent">
                <TableHead>Producto</TableHead>
                <TableHead class="w-24 text-center">Cantidad</TableHead>
                <TableHead class="text-right">Precio Unitario</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="d in detalle" :key="d.id_detalle" class="transition-colors duration-150 hover:bg-muted/50">
                <TableCell class="font-medium">{{ d.producto }}</TableCell>
                <TableCell class="text-center">{{ d.cantidad }}</TableCell>
                <TableCell class="text-right font-mono">Q{{ Number(d.precio_unitario).toFixed(2) }}</TableCell>
              </TableRow>
              <TableRow v-if="!detalle.length">
                <TableCell colspan="3" class="py-6 text-center text-muted-foreground">Sin items para esta compra</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </template>
  </div>
</template>
