<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import ventaService from '../services/venta.service'
import VentaForm from '../components/VentaForm.vue'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { useSuccess, useError } from '@/composables/useSwal'
import gsap from 'gsap'

const ventas = ref<any[]>([])
const router = useRouter()
const showForm = ref(false)
const expandedId = ref<number | null>(null)
const detalles = ref<Record<number, any[]>>({})
const loadingDetalle = ref<number | null>(null)
const page = ref(1)
const perPage = 10

const totalPages = computed(() => Math.max(1, Math.ceil(ventas.value.length / perPage)))
const paginatedVentas = computed(() => {
  const start = (page.value - 1) * perPage
  return ventas.value.slice(start, start + perPage)
})

async function load() {
  try {
    const res = await ventaService.getAll()
    ventas.value = res.data
    if (page.value > totalPages.value) page.value = totalPages.value
  } catch {
    useError('Error', 'No se pudieron cargar las ventas')
  }
}

async function toggleDetalle(ventaId: number) {
  if (expandedId.value === ventaId) {
    expandedId.value = null
    return
  }
  if (!detalles.value[ventaId]) {
    loadingDetalle.value = ventaId
    try {
      const res = await ventaService.getDetalle(ventaId)
      detalles.value[ventaId] = res.data
    } catch {
      useError('Error', 'No se pudo cargar el detalle')
      return
    } finally {
      loadingDetalle.value = null
    }
  }
  expandedId.value = ventaId
}

async function save(data: any) {
  try {
    await ventaService.create(data)
    await useSuccess('Venta registrada', 'La venta se registro exitosamente')
    showForm.value = false
    await load()
  } catch (err: any) {
    useError('Error al registrar venta', err.response?.data?.error ?? 'Ocurrio un error inesperado')
  }
}

onMounted(async () => {
  await load()
  gsap.from('.ventas-table tr', {
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
        <h1 class="text-2xl font-bold">Ventas</h1>
        <Badge variant="secondary" class="text-xs">{{ ventas.length }} registradas</Badge>
      </div>
      <Button class="gap-1.5 transition-all duration-200 hover:scale-105 hover:shadow-md hover:shadow-primary/20" @click="showForm = true">
        + Nueva Venta
      </Button>
    </div>

    <div class="rounded-lg border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow class="hover:bg-transparent">
            <TableHead class="w-16">ID</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Empleado</TableHead>
            <TableHead class="text-right">Total</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead class="w-44 text-center">Detalle</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody class="ventas-table">
          <template v-for="v in paginatedVentas" :key="v.id_venta">
            <TableRow class="transition-colors duration-150 hover:bg-muted/50 cursor-pointer" @click="toggleDetalle(v.id_venta)">
              <TableCell class="font-mono text-muted-foreground text-xs">{{ v.id_venta }}</TableCell>
              <TableCell>{{ new Date(v.fecha).toLocaleDateString('es-GT', { year: 'numeric', month: 'short', day: 'numeric' }) }}</TableCell>
              <TableCell class="font-medium">{{ v.cliente }}</TableCell>
              <TableCell class="text-muted-foreground">{{ v.empleado ?? 'Web' }}</TableCell>
              <TableCell class="text-right font-mono font-medium">Q{{ Number(v.total).toFixed(2) }}</TableCell>
              <TableCell>
                <Badge variant="secondary" class="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                  {{ v.estado }}
                </Badge>
              </TableCell>
              <TableCell class="text-center">
                <div class="flex items-center justify-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    class="h-7 px-2 text-xs transition-all duration-200 hover:bg-primary/10 hover:text-primary"
                    :disabled="loadingDetalle === v.id_venta"
                  >
                    {{ loadingDetalle === v.id_venta ? '...' : expandedId === v.id_venta ? 'Ocultar' : 'Ver' }}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    class="h-7 px-2 text-xs transition-all duration-200 hover:border-primary/50 hover:text-primary hover:bg-primary/5"
                    @click.stop="router.push(`/ventas/${v.id_venta}`)"
                  >
                    Vista
                  </Button>
                </div>
              </TableCell>
            </TableRow>
            <!-- Detalle expandido -->
            <TableRow v-if="expandedId === v.id_venta && detalles[v.id_venta]" class="bg-muted/30">
              <TableCell colspan="7" class="p-0">
                <div class="px-8 py-3">
                  <p class="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Detalle de venta #{{ v.id_venta }}</p>
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
                      <TableRow v-for="(d, i) in detalles[v.id_venta]" :key="i" class="hover:bg-muted/50">
                        <TableCell class="font-medium">{{ d.producto }}</TableCell>
                        <TableCell class="text-center">{{ d.cantidad }}</TableCell>
                        <TableCell class="text-right font-mono">Q{{ Number(d.precio_unitario).toFixed(2) }}</TableCell>
                        <TableCell class="text-right font-mono font-medium">Q{{ (d.cantidad * Number(d.precio_unitario)).toFixed(2) }}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </TableCell>
            </TableRow>
          </template>
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

    <VentaForm v-if="showForm" @save="save" @cancel="showForm = false" />
  </div>
</template>
