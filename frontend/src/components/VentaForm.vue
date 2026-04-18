<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import api from '../services/api'

const emit = defineEmits<{
  save: [data: any]
  cancel: []
}>()

const clientes = ref<any[]>([])
const productos = ref<any[]>([])
const clienteId = ref('')
const items = ref<{ producto_id: string; cantidad: number; precio_unitario: number }[]>([])
const error = ref('')

onMounted(async () => {
  const [cRes, pRes] = await Promise.all([
    api.get('/clientes'),
    api.get('/productos'),
  ])
  clientes.value = cRes.data
  productos.value = pRes.data
})

function addItem() {
  items.value.push({ producto_id: '', cantidad: 1, precio_unitario: 0 })
}

function removeItem(i: number) {
  items.value.splice(i, 1)
}

function onProductoChange(i: number) {
  const item = items.value[i]!
  const prod = productos.value.find((p: any) => String(p.id_producto) === String(item.producto_id))
  if (prod) {
    item.precio_unitario = Number(prod.precio)
  }
}

const total = computed(() =>
  items.value.reduce((sum, it) => sum + it.cantidad * it.precio_unitario, 0)
)

function submit() {
  error.value = ''
  if (!clienteId.value) {
    error.value = 'Seleccione un cliente'
    return
  }
  if (items.value.length === 0) {
    error.value = 'Agregue al menos un producto'
    return
  }
  for (const item of items.value) {
    if (!item.producto_id || item.cantidad <= 0) {
      error.value = 'Todos los items deben tener producto y cantidad > 0'
      return
    }
  }
  emit('save', {
    cliente_id: Number(clienteId.value),
    empleado_id: null,
    items: items.value.map(it => ({
      producto_id: Number(it.producto_id),
      cantidad: it.cantidad,
      precio_unitario: it.precio_unitario,
    })),
  })
}
</script>

<template>
  <div class="modal-overlay" @click.self="emit('cancel')">
    <div class="modal modal-lg">
      <h2>Nueva Venta</h2>
      <div v-if="error" class="error-msg">{{ error }}</div>
      <form @submit.prevent="submit">
        <div class="form-group">
          <label>Cliente *</label>
          <select v-model="clienteId" required>
            <option value="">Seleccionar...</option>
            <option v-for="c in clientes" :key="c.id_cliente" :value="c.id_cliente">
              {{ c.nombre }}
            </option>
          </select>
        </div>

        <div class="items-header">
          <h3>Productos</h3>
          <button type="button" class="btn btn-xs" @click="addItem">+ Agregar</button>
        </div>

        <table v-if="items.length" class="items-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Precio Unit.</th>
              <th>Subtotal</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, i) in items" :key="i">
              <td>
                <select v-model="item.producto_id" @change="onProductoChange(i)" required>
                  <option value="">Seleccionar...</option>
                  <option v-for="p in productos" :key="p.id_producto" :value="p.id_producto">
                    {{ p.titulo }} (stock: {{ p.stock }})
                  </option>
                </select>
              </td>
              <td><input v-model.number="item.cantidad" type="number" min="1" style="width:70px" /></td>
              <td class="text-right">Q{{ item.precio_unitario.toFixed(2) }}</td>
              <td class="text-right">Q{{ (item.cantidad * item.precio_unitario).toFixed(2) }}</td>
              <td><button type="button" class="btn btn-xs btn-danger" @click="removeItem(i)">X</button></td>
            </tr>
          </tbody>
        </table>

        <div class="total-row">
          <strong>Total: Q{{ total.toFixed(2) }}</strong>
        </div>

        <div class="form-actions">
          <button type="button" class="btn" @click="emit('cancel')">Cancelar</button>
          <button type="submit" class="btn btn-primary">Registrar Venta</button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.items-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 1rem 0 0.5rem;
}
.items-header h3 {
  margin: 0;
  font-size: 1rem;
}
.items-table {
  width: 100%;
  margin-bottom: 0.5rem;
}
.items-table select,
.items-table input {
  padding: 0.3rem 0.5rem;
  font-size: 0.85rem;
}
.total-row {
  text-align: right;
  padding: 0.75rem 0;
  font-size: 1.1rem;
  border-top: 2px solid var(--color-border);
}
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
}
.modal-lg {
  max-width: 700px;
}
</style>
