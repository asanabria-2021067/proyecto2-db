<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import api from '../services/api'

const props = defineProps<{
  producto: any | null
}>()

const emit = defineEmits<{
  save: [data: any]
  cancel: []
}>()

const form = ref({
  titulo: '',
  descripcion: '',
  precio: 0,
  stock: 0,
  isbn: '',
  anio_publicacion: 2024,
  imagen_url: '',
  categoria_id: '',
  editorial_id: '',
  autores: [] as number[],
})

const categorias = ref<any[]>([])
const editoriales = ref<any[]>([])
const autores = ref<any[]>([])
const errors = ref<string[]>([])

onMounted(async () => {
  const [catRes, edRes, autRes] = await Promise.all([
    api.get('/categorias'),
    api.get('/editoriales'),
    api.get('/autores'),
  ])
  categorias.value = catRes.data
  editoriales.value = edRes.data
  autores.value = autRes.data
})

watch(() => props.producto, (p) => {
  if (p) {
    form.value = {
      titulo: p.titulo ?? '',
      descripcion: p.descripcion ?? '',
      precio: p.precio ?? 0,
      stock: p.stock ?? 0,
      isbn: p.isbn ?? '',
      anio_publicacion: p.anio_publicacion ?? 2024,
      imagen_url: p.imagen_url ?? '',
      categoria_id: p.categoria_id ?? '',
      editorial_id: p.editorial_id ?? '',
      autores: [],
    }
  }
}, { immediate: true })

function validate(): boolean {
  errors.value = []
  if (!form.value.titulo.trim()) errors.value.push('Titulo es requerido')
  if (form.value.precio <= 0) errors.value.push('Precio debe ser mayor a 0')
  if (form.value.stock < 0) errors.value.push('Stock no puede ser negativo')
  if (!form.value.categoria_id) errors.value.push('Categoria es requerida')
  if (!form.value.editorial_id) errors.value.push('Editorial es requerida')
  return errors.value.length === 0
}

function submit() {
  if (!validate()) return
  emit('save', { ...form.value })
}
</script>

<template>
  <div class="modal-overlay" @click.self="emit('cancel')">
    <div class="modal">
      <h2>{{ producto?.id_producto ? 'Editar' : 'Nuevo' }} Producto</h2>
      <div v-if="errors.length" class="error-msg">
        <div v-for="e in errors" :key="e">{{ e }}</div>
      </div>
      <form @submit.prevent="submit">
        <div class="form-row">
          <div class="form-group">
            <label>Titulo *</label>
            <input v-model="form.titulo" required />
          </div>
          <div class="form-group">
            <label>ISBN</label>
            <input v-model="form.isbn" />
          </div>
        </div>
        <div class="form-group">
          <label>Descripcion</label>
          <textarea v-model="form.descripcion" rows="2"></textarea>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Precio *</label>
            <input v-model.number="form.precio" type="number" step="0.01" min="0.01" required />
          </div>
          <div class="form-group">
            <label>Stock *</label>
            <input v-model.number="form.stock" type="number" min="0" required />
          </div>
          <div class="form-group">
            <label>Anio</label>
            <input v-model.number="form.anio_publicacion" type="number" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Categoria *</label>
            <select v-model="form.categoria_id" required>
              <option value="">Seleccionar...</option>
              <option v-for="c in categorias" :key="c.id_categoria" :value="c.id_categoria">
                {{ c.nombre }} ({{ c.tipo }})
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Editorial *</label>
            <select v-model="form.editorial_id" required>
              <option value="">Seleccionar...</option>
              <option v-for="e in editoriales" :key="e.id_editorial" :value="e.id_editorial">
                {{ e.nombre }}
              </option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label>Autores</label>
          <select v-model="form.autores" multiple>
            <option v-for="a in autores" :key="a.id_autor" :value="a.id_autor">
              {{ a.nombre }}
            </option>
          </select>
        </div>
        <div class="form-actions">
          <button type="button" class="btn" @click="emit('cancel')">Cancelar</button>
          <button type="submit" class="btn btn-primary">Guardar</button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.75rem;
}
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
}
select[multiple] {
  height: 80px;
}
</style>
