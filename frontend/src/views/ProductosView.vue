<script setup lang="ts">
import { ref, onMounted } from 'vue'
import productoService from '../services/producto.service'
import ProductoForm from '../components/ProductoForm.vue'

const productos = ref<any[]>([])
const showForm = ref(false)
const editing = ref<any | null>(null)
const error = ref('')
const success = ref('')

async function load() {
  try {
    const res = await productoService.getAll()
    productos.value = res.data
  } catch {
    error.value = 'Error al cargar productos'
  }
}

function openNew() {
  editing.value = null
  showForm.value = true
}

function openEdit(p: any) {
  editing.value = { ...p }
  showForm.value = true
}

async function save(data: any) {
  error.value = ''
  success.value = ''
  try {
    if (editing.value?.id_producto) {
      await productoService.update(editing.value.id_producto, data)
      success.value = 'Producto actualizado'
    } else {
      await productoService.create(data)
      success.value = 'Producto creado'
    }
    showForm.value = false
    await load()
  } catch (err: any) {
    error.value = err.response?.data?.error ?? 'Error al guardar producto'
  }
}

async function remove(id: number) {
  if (!confirm('Eliminar este producto?')) return
  error.value = ''
  try {
    await productoService.remove(id)
    success.value = 'Producto eliminado'
    await load()
  } catch (err: any) {
    error.value = err.response?.data?.error ?? 'Error al eliminar producto'
  }
}

onMounted(load)
</script>

<template>
  <div>
    <div class="page-header">
      <h1>Productos</h1>
      <button class="btn btn-primary" @click="openNew">+ Nuevo Producto</button>
    </div>

    <div v-if="error" class="error-msg">{{ error }}</div>
    <div v-if="success" class="success-msg">{{ success }}</div>

    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Titulo</th>
            <th>Categoria</th>
            <th>Editorial</th>
            <th>Autores</th>
            <th>Precio</th>
            <th>Stock</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in productos" :key="p.id_producto">
            <td>{{ p.id_producto }}</td>
            <td>{{ p.titulo }}</td>
            <td><span class="badge">{{ p.tipo }}</span> {{ p.categoria }}</td>
            <td>{{ p.editorial }}</td>
            <td>{{ p.autores ?? '-' }}</td>
            <td class="text-right">Q{{ Number(p.precio).toFixed(2) }}</td>
            <td :class="{ 'stock-low': p.stock <= 5 }">{{ p.stock }}</td>
            <td>
              <button class="btn btn-xs" @click="openEdit(p)">Editar</button>
              <button class="btn btn-xs btn-danger" @click="remove(p.id_producto)">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <ProductoForm
      v-if="showForm"
      :producto="editing"
      @save="save"
      @cancel="showForm = false"
    />
  </div>
</template>

<style scoped>
.stock-low {
  color: var(--color-danger);
  font-weight: 700;
}
</style>
