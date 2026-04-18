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
        backgroundColor: '#4f46e5',
      }],
    }

    ventasMesChartData.value = {
      labels: mesRes.data.map((m: any) => m.mes),
      datasets: [{
        label: 'Total ventas (Q)',
        data: mesRes.data.map((m: any) => Number(m.total)),
        borderColor: '#4f46e5',
        backgroundColor: 'rgba(79,70,229,0.1)',
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
  } catch {
    alert('Error al exportar CSV')
  }
}

onMounted(load)

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
}
</script>

<template>
  <div>
    <div class="page-header">
      <h1>Dashboard</h1>
      <button class="btn btn-primary" @click="exportCsv">Exportar Ventas CSV</button>
    </div>

    <div v-if="loading" class="loading">Cargando reportes...</div>

    <template v-else>
      <div class="charts-grid">
        <div class="card">
          <h3>Top 10 Productos Mas Vendidos</h3>
          <div class="chart-container">
            <Bar :data="topChartData" :options="chartOptions" />
          </div>
        </div>
        <div class="card">
          <h3>Ventas por Mes</h3>
          <div class="chart-container">
            <Line :data="ventasMesChartData" :options="chartOptions" />
          </div>
        </div>
      </div>

      <div class="tables-grid">
        <div class="card">
          <h3>Stock Bajo (5 o menos)</h3>
          <table>
            <thead>
              <tr><th>Producto</th><th>Stock</th><th>Precio</th></tr>
            </thead>
            <tbody>
              <tr v-for="p in stockBajo" :key="p.id_producto">
                <td>{{ p.titulo }}</td>
                <td class="stock-low">{{ p.stock }}</td>
                <td>Q{{ Number(p.precio).toFixed(2) }}</td>
              </tr>
              <tr v-if="!stockBajo.length"><td colspan="3">Sin productos con stock bajo</td></tr>
            </tbody>
          </table>
        </div>

        <div class="card">
          <h3>Productos No Vendidos</h3>
          <table>
            <thead>
              <tr><th>Producto</th><th>Stock</th><th>Precio</th></tr>
            </thead>
            <tbody>
              <tr v-for="p in productosNoVendidos" :key="p.id_producto">
                <td>{{ p.titulo }}</td>
                <td>{{ p.stock }}</td>
                <td>Q{{ Number(p.precio).toFixed(2) }}</td>
              </tr>
              <tr v-if="!productosNoVendidos.length"><td colspan="3">Todos los productos se han vendido</td></tr>
            </tbody>
          </table>
        </div>

        <div class="card">
          <h3>Ranking Clientes (CTE)</h3>
          <table>
            <thead>
              <tr><th>#</th><th>Cliente</th><th>Compras</th><th>Total</th></tr>
            </thead>
            <tbody>
              <tr v-for="c in rankingClientes" :key="c.id_cliente">
                <td>{{ c.ranking }}</td>
                <td>{{ c.nombre }}</td>
                <td>{{ c.cantidad_compras }}</td>
                <td>Q{{ Number(c.total_gastado).toFixed(2) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.charts-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}
.chart-container {
  height: 250px;
  position: relative;
}
.tables-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1.5rem;
}
.stock-low {
  color: var(--color-danger);
  font-weight: 700;
}
.loading {
  text-align: center;
  padding: 3rem;
  color: var(--color-text-muted);
}
@media (max-width: 900px) {
  .charts-grid,
  .tables-grid {
    grid-template-columns: 1fr;
  }
}
</style>
