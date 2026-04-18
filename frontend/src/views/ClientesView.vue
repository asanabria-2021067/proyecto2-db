<script setup lang="ts">
import { ref, onMounted } from 'vue'
import clienteService from '../services/cliente.service'

const clientes = ref<any[]>([])
const showForm = ref(false)
const editing = ref<any | null>(null)
const form = ref({ nombre: '', email: '', telefono: '', direccion: '' })
const error = ref('')
const success = ref('')
const formErrors = ref<string[]>([])

async function load() {
  try {
    const res = await clienteService.getAll()
    clientes.value = res.data
  } catch {
    error.value = 'Error al cargar clientes'
  }
}

function openNew() {
  editing.value = null
  form.value = { nombre: '', email: '', telefono: '', direccion: '' }
  showForm.value = true
}

function openEdit(c: any) {
  editing.value = c
  form.value = { nombre: c.nombre, email: c.email ?? '', telefono: c.telefono ?? '', direccion: c.direccion ?? '' }
  showForm.value = true
}

function validate(): boolean {
  formErrors.value = []
  if (!form.value.nombre.trim()) formErrors.value.push('Nombre es requerido')
  return formErrors.value.length === 0
}

async function save() {
  if (!validate()) return
  error.value = ''
  success.value = ''
  try {
    if (editing.value) {
      await clienteService.update(editing.value.id_cliente, form.value)
      success.value = 'Cliente actualizado'
    } else {
      await clienteService.create(form.value)
      success.value = 'Cliente creado'
    }
    showForm.value = false
    await load()
  } catch (err: any) {
    error.value = err.response?.data?.error ?? 'Error al guardar cliente'
  }
}

async function remove(id: number) {
  if (!confirm('Eliminar este cliente?')) return
  error.value = ''
  try {
    await clienteService.remove(id)
    success.value = 'Cliente eliminado'
    await load()
  } catch (err: any) {
    error.value = err.response?.data?.error ?? 'Error al eliminar cliente'
  }
}

onMounted(load)
</script>

<template>
  <div>
    <div class="page-header">
      <h1>Clientes</h1>
      <button class="btn btn-primary" @click="openNew">+ Nuevo Cliente</button>
    </div>

    <div v-if="error" class="error-msg">{{ error }}</div>
    <div v-if="success" class="success-msg">{{ success }}</div>

    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Email</th>
            <th>Telefono</th>
            <th>Direccion</th>
            <th>Usuario</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in clientes" :key="c.id_cliente">
            <td>{{ c.id_cliente }}</td>
            <td>{{ c.nombre }}</td>
            <td>{{ c.email ?? '-' }}</td>
            <td>{{ c.telefono ?? '-' }}</td>
            <td>{{ c.direccion ?? '-' }}</td>
            <td>{{ c.username ?? '-' }}</td>
            <td>
              <button class="btn btn-xs" @click="openEdit(c)">Editar</button>
              <button class="btn btn-xs btn-danger" @click="remove(c.id_cliente)">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal inline -->
    <div v-if="showForm" class="modal-overlay" @click.self="showForm = false">
      <div class="modal">
        <h2>{{ editing ? 'Editar' : 'Nuevo' }} Cliente</h2>
        <div v-if="formErrors.length" class="error-msg">
          <div v-for="e in formErrors" :key="e">{{ e }}</div>
        </div>
        <form @submit.prevent="save">
          <div class="form-group">
            <label>Nombre *</label>
            <input v-model="form.nombre" required />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Email</label>
              <input v-model="form.email" type="email" />
            </div>
            <div class="form-group">
              <label>Telefono</label>
              <input v-model="form.telefono" />
            </div>
          </div>
          <div class="form-group">
            <label>Direccion</label>
            <input v-model="form.direccion" />
          </div>
          <div class="form-actions">
            <button type="button" class="btn" @click="showForm = false">Cancelar</button>
            <button type="submit" class="btn btn-primary">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
}
</style>
