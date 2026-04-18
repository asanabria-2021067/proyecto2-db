<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Bar, Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import reporteService from '../services/reporte.service'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { useSuccess, useError } from '@/composables/useSwal'
import gsap from 'gsap'

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend)

const topProductos = ref<any[]>([])
const ventasPorMes = ref<any[]>([])
const stockBajo = ref<any[]>([])
const productosNoVendidos = ref<any[]>([])
const rankingClientes = ref<any[]>([])
const loading = ref(true)

const topChartData = ref<any>({ labels: [], datasets: [] })
const ventasMesChartData = ref<any>({ labels: [], datasets: [] })

async function load() {
  try {
    const [topRes, mesRes, stockRes, noVendRes, rankRes] = await Promise.all([
      reporteService.topProductos(),
      reporteService.ventasPorMes(),
      reporteService.stockBajo(),
      reporteService.productosNoVendidos(),
      reporteService.rankingClientes(),
    ])

    topProductos.value = topRes.data
    ventasPorMes.value = mesRes.data
    stockBajo.value = stockRes.data
    productosNoVendidos.value = noVendRes.data
    rankingClientes.value = rankRes.data

    topChartData.value = {
      labels: topRes.data.map((p: any) => p.titulo.substring(0, 20)),
      datasets: [{
        label: 'Unidades vendidas',
        data: topRes.data.map((p: any) => Number(p.total_vendido)),
        backgroundColor: 'oklch(0.45 0.18 265)',
        borderRadius: 6,
      }],
    }

    ventasMesChartData.value = {
      labels: mesRes.data.map((m: any) => m.mes),
      datasets: [{
        label: 'Total ventas (Q)',
        data: mesRes.data.map((m: any) => Number(m.total)),
        borderColor: 'oklch(0.45 0.18 265)',
        backgroundColor: 'oklch(0.45 0.18 265 / 0.1)',
        fill: true,
        tension: 0.3,
      }],
    }
  } catch {
    // silently fail
  } finally {
    loading.value = false
  }
}

async function exportCsv() {
  try {
    const res = await reporteService.exportCsv()
    const url = window.URL.createObjectURL(new Blob([res.data]))
    const a = document.createElement('a')
    a.href = url
    a.download = 'ventas.csv'
    a.click()
    window.URL.revokeObjectURL(url)
    await useSuccess('Exportado', 'El archivo CSV se descargo correctamente')
  } catch {
    useError('Error', 'No se pudo exportar el CSV')
  }
}

onMounted(async () => {
  await load()
  gsap.from('.dashboard-card', {
    y: 20,
    opacity: 0,
    duration: 0.25,
    stagger: 0.05,
    ease: 'power2.out',
  })
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Dashboard</h1>
      <Button variant="outline" class="gap-1.5 transition-all duration-200 hover:border-primary/50 hover:text-primary hover:bg-primary/5 hover:shadow-sm" @click="exportCsv">
        Exportar Ventas CSV
      </Button>
    </div>

    <div v-if="loading" class="text-center py-16 text-muted-foreground">Cargando reportes...</div>

    <template v-else>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card class="dashboard-card shadow-sm transition-all duration-250 hover:shadow-md hover:-translate-y-0.5">
          <CardHeader>
            <CardTitle class="text-sm font-medium text-muted-foreground uppercase tracking-wide">Top 10 Productos Mas Vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="h-64">
              <Bar :data="topChartData" :options="chartOptions" />
            </div>
          </CardContent>
        </Card>
        <Card class="dashboard-card shadow-sm transition-all duration-250 hover:shadow-md hover:-translate-y-0.5">
          <CardHeader>
            <CardTitle class="text-sm font-medium text-muted-foreground uppercase tracking-wide">Ventas por Mes</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="h-64">
              <Line :data="ventasMesChartData" :options="chartOptions" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card class="dashboard-card shadow-sm transition-all duration-250 hover:shadow-md hover:-translate-y-0.5">
          <CardHeader>
            <CardTitle class="text-sm font-medium text-muted-foreground uppercase tracking-wide">Stock Bajo (5 o menos)</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow class="hover:bg-transparent">
                  <TableHead>Producto</TableHead>
                  <TableHead class="text-right">Stock</TableHead>
                  <TableHead class="text-right">Precio</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="p in stockBajo" :key="p.id_producto" class="transition-colors duration-150 hover:bg-muted/50">
                  <TableCell class="font-medium">{{ p.titulo }}</TableCell>
                  <TableCell class="text-right">
                    <Badge variant="destructive">{{ p.stock }}</Badge>
                  </TableCell>
                  <TableCell class="text-right font-mono">Q{{ Number(p.precio).toFixed(2) }}</TableCell>
                </TableRow>
                <TableRow v-if="!stockBajo.length">
                  <TableCell colspan="3" class="text-center text-muted-foreground py-6">Sin productos con stock bajo</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card class="dashboard-card shadow-sm transition-all duration-250 hover:shadow-md hover:-translate-y-0.5">
          <CardHeader>
            <CardTitle class="text-sm font-medium text-muted-foreground uppercase tracking-wide">Productos No Vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow class="hover:bg-transparent">
                  <TableHead>Producto</TableHead>
                  <TableHead class="text-right">Stock</TableHead>
                  <TableHead class="text-right">Precio</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="p in productosNoVendidos" :key="p.id_producto" class="transition-colors duration-150 hover:bg-muted/50">
                  <TableCell class="font-medium">{{ p.titulo }}</TableCell>
                  <TableCell class="text-right">{{ p.stock }}</TableCell>
                  <TableCell class="text-right font-mono">Q{{ Number(p.precio).toFixed(2) }}</TableCell>
                </TableRow>
                <TableRow v-if="!productosNoVendidos.length">
                  <TableCell colspan="3" class="text-center text-muted-foreground py-6">Todos los productos se han vendido</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card class="dashboard-card shadow-sm transition-all duration-250 hover:shadow-md hover:-translate-y-0.5">
          <CardHeader>
            <CardTitle class="text-sm font-medium text-muted-foreground uppercase tracking-wide">Ranking Clientes (CTE)</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow class="hover:bg-transparent">
                  <TableHead class="w-10">#</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead class="text-right">Compras</TableHead>
                  <TableHead class="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="c in rankingClientes" :key="c.id_cliente" class="transition-colors duration-150 hover:bg-muted/50">
                  <TableCell class="font-mono text-muted-foreground">{{ c.ranking }}</TableCell>
                  <TableCell class="font-medium">{{ c.nombre }}</TableCell>
                  <TableCell class="text-right">{{ c.cantidad_compras }}</TableCell>
                  <TableCell class="text-right font-mono">Q{{ Number(c.total_gastado).toFixed(2) }}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </template>
  </div>
</template>
