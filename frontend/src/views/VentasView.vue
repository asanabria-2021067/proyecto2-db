<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ventaService from '../services/venta.service'
import VentaForm from '../components/VentaForm.vue'

const ventas = ref<any[]>([])
const showForm = ref(false)
const error = ref('')
const success = ref('')

async function load() {
  try {
    const res = await ventaService.getAll()
    ventas.value = res.data
  } catch {
    error.value = 'Error al cargar ventas'
  }
}

async function save(data: any) {
  error.value = ''
  success.value = ''
  try {
    await ventaService.create(data)
    success.value = 'Venta registrada exitosamente'
    showForm.value = false
    await load()
  } catch (err: any) {
    error.value = err.response?.data?.error ?? 'Error al registrar venta'
  }
}

onMounted(load)
</script>

<template>
  <div>
    <div class="page-header">
      <h1>Ventas</h1>
      <button class="btn btn-primary" @click="showForm = true">+ Nueva Venta</button>
    </div>

    <div v-if="error" class="error-msg">{{ error }}</div>
    <div v-if="success" class="success-msg">{{ success }}</div>

    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Fecha</th>
            <th>Cliente</th>
            <th>Empleado</th>
            <th>Total</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="v in ventas" :key="v.id_venta">
            <td>{{ v.id_venta }}</td>
            <td>{{ new Date(v.fecha).toLocaleDateString() }}</td>
            <td>{{ v.cliente }}</td>
            <td>{{ v.empleado }}</td>
            <td class="text-right">Q{{ Number(v.total).toFixed(2) }}</td>
            <td><span class="badge badge-success">{{ v.estado }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>

    <VentaForm v-if="showForm" @save="save" @cancel="showForm = false" />
  </div>
</template>
