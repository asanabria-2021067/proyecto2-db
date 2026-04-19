<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ReceiptText } from 'lucide-vue-next'
import ventaService from '@/services/venta.service'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { useError } from '@/composables/useSwal'
import gsap from 'gsap'

const compras = ref<any[]>([])
const loading = ref(true)

const totalGastado = computed(() => compras.value.reduce((sum, c) => sum + Number(c.total), 0))
const totalArticulos = computed(() =>
  compras.value.reduce((sum, c) => sum + (c.detalle ?? []).reduce((a: number, d: any) => a + Number(d.cantidad), 0), 0),
)

function itemsCount(detalle: any[]) {
  return (detalle ?? []).reduce((sum: number, d: any) => sum + Number(d.cantidad), 0)
}

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
    duration: 0.25,
    stagger: 0.05,
    ease: 'power2.out',
    clearProps: 'transform,opacity',
  })
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <ReceiptText class="h-5 w-5" />
        </div>
        <div>
          <h1 class="text-2xl font-bold">Mis Compras</h1>
          <p class="text-sm text-muted-foreground">Historial completo de tus pedidos</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <Badge variant="secondary">{{ compras.length }} compras</Badge>
        <Badge variant="secondary">{{ totalArticulos }} articulos</Badge>
        <Badge variant="secondary">Q{{ totalGastado.toFixed(2) }}</Badge>
      </div>
    </div>

    <div v-if="loading" class="py-16 text-center text-muted-foreground">Cargando compras...</div>

    <div v-else-if="compras.length === 0" class="rounded-2xl border bg-card p-12 text-center shadow-sm">
      <p class="text-lg font-semibold text-foreground">Aun no has realizado compras</p>
      <p class="mt-1 text-sm text-muted-foreground">Agrega productos al carrito para verlos aqui.</p>
    </div>

    <div v-else class="space-y-4">
      <Card
        v-for="c in compras"
        :key="c.id_venta"
        class="compra-card rounded-2xl shadow-sm transition-all duration-250 hover:-translate-y-0.5 hover:shadow-md"
      >
        <CardHeader class="pb-3">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <CardTitle class="text-sm font-semibold">Compra #{{ c.id_venta }}</CardTitle>
            <div class="flex items-center gap-2">
              <span class="text-xs text-muted-foreground">
                {{ new Date(c.fecha).toLocaleString('es-GT', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) }}
              </span>
              <Badge variant="secondary" class="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                {{ c.estado }}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent class="space-y-3">
          <Table>
            <TableHeader>
              <TableRow class="hover:bg-transparent">
                <TableHead>Producto</TableHead>
                <TableHead class="w-28 text-center">Cantidad</TableHead>
                <TableHead class="text-right">Precio Unit.</TableHead>
                <TableHead class="text-right">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="(d, i) in c.detalle" :key="i" class="transition-colors duration-150 hover:bg-muted/50">
                <TableCell>
                  <div class="flex items-center gap-3">
                    <img v-if="d.imagen_url" :src="d.imagen_url" :alt="d.producto" class="h-12 w-9 rounded object-cover" />
                    <div>
                      <p class="font-medium">{{ d.producto }}</p>
                      <p v-if="d.isbn" class="text-xs text-muted-foreground">ISBN: {{ d.isbn }}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell class="text-center">{{ d.cantidad }}</TableCell>
                <TableCell class="text-right font-mono">Q{{ Number(d.precio_unitario).toFixed(2) }}</TableCell>
                <TableCell class="text-right font-mono font-semibold">Q{{ (Number(d.cantidad) * Number(d.precio_unitario)).toFixed(2) }}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <div class="flex flex-wrap items-center justify-between gap-2 border-t pt-3">
            <p class="text-xs text-muted-foreground">
              Articulos en esta compra:
              <span class="font-semibold text-foreground">
                {{ itemsCount(c.detalle ?? []) }}
              </span>
            </p>
            <p class="text-lg font-bold">
              Total:
              <span class="font-mono text-primary">Q{{ Number(c.total).toFixed(2) }}</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
