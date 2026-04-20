<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import reporteService from '@/services/reporte.service'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { useError } from '@/composables/useSwal'
import gsap from 'gsap'

const clientes = ref<any[]>([])
const loading = ref(true)

const sortedClientes = computed(() =>
  [...clientes.value].sort((a, b) => Number(b.total_gastado) - Number(a.total_gastado)),
)

async function load() {
  try {
    const res = await reporteService.clientesSobrePromedio()
    clientes.value = res.data
  } catch {
    useError('Error', 'No se pudieron cargar los clientes sobre promedio')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await load()
  gsap.from('.clientes-promedio-table tr', {
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
      <h1 class="text-2xl font-bold">Clientes con gasto superior al promedio</h1>
      <Badge variant="secondary" class="text-xs">{{ clientes.length }} clientes</Badge>
    </div>

    <Card class="shadow-sm">
      <CardHeader class="pb-3">
        <CardTitle class="text-sm font-medium uppercase tracking-wide text-muted-foreground">Ranking de clientes</CardTitle>
      </CardHeader>
      <CardContent class="pt-0">
        <div v-if="loading" class="py-16 text-center text-muted-foreground">Cargando ranking...</div>
        <Table v-else>
          <TableHeader>
            <TableRow class="hover:bg-transparent">
              <TableHead class="w-16">#</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead class="text-right">Total gastado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody class="clientes-promedio-table">
            <TableRow v-for="(c, idx) in sortedClientes" :key="c.id_cliente" class="transition-colors duration-150 hover:bg-muted/50">
              <TableCell>
                <Badge :variant="idx < 3 ? 'secondary' : 'outline'">{{ idx + 1 }}</Badge>
              </TableCell>
              <TableCell class="font-medium">{{ c.nombre }}</TableCell>
              <TableCell class="text-muted-foreground">{{ c.email ?? '-' }}</TableCell>
              <TableCell class="text-right font-mono font-semibold">Q{{ Number(c.total_gastado).toFixed(2) }}</TableCell>
            </TableRow>
            <TableRow v-if="!sortedClientes.length">
              <TableCell colspan="4" class="py-6 text-center text-muted-foreground">No hay datos para este reporte</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </div>
</template>
