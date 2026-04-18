<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import api from '../services/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'

const props = defineProps<{
  producto: any | null
}>()

const emit = defineEmits<{
  save: [data: any]
  cancel: []
}>()

const open = ref(true)

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
const imagenTab = ref<'url' | 'upload'>('url')
const uploading = ref(false)

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
      categoria_id: String(p.categoria_id ?? ''),
      editorial_id: String(p.editorial_id ?? ''),
      autores: [],
    }
  }
}, { immediate: true })

async function handleFileUpload(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  uploading.value = true
  try {
    const fd = new FormData()
    fd.append('imagen', file)
    const res = await api.post('/upload', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    form.value.imagen_url = res.data.url
  } catch {
    errors.value = ['Error al subir imagen']
  } finally {
    uploading.value = false
  }
}

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
  emit('save', {
    ...form.value,
    categoria_id: Number(form.value.categoria_id),
    editorial_id: Number(form.value.editorial_id),
  })
}

function handleOpenChange(val: boolean) {
  if (!val) emit('cancel')
  open.value = val
}
</script>

<template>
  <Dialog :open="open" @update:open="handleOpenChange">
    <DialogContent class="sm:max-w-lg max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{{ producto?.id_producto ? 'Editar' : 'Nuevo' }} Producto</DialogTitle>
      </DialogHeader>

      <div v-if="errors.length" class="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive space-y-1">
        <div v-for="e in errors" :key="e">{{ e }}</div>
      </div>

      <form @submit.prevent="submit" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label>Titulo *</Label>
            <Input v-model="form.titulo" required />
          </div>
          <div class="space-y-2">
            <Label>ISBN</Label>
            <Input v-model="form.isbn" />
          </div>
        </div>

        <div class="space-y-2">
          <Label>Descripcion</Label>
          <Textarea v-model="form.descripcion" rows="2" />
        </div>

        <div class="grid grid-cols-3 gap-4">
          <div class="space-y-2">
            <Label>Precio *</Label>
            <Input v-model.number="form.precio" type="number" step="0.01" min="0.01" required />
          </div>
          <div class="space-y-2">
            <Label>Stock *</Label>
            <Input v-model.number="form.stock" type="number" min="0" required />
          </div>
          <div class="space-y-2">
            <Label>Anio</Label>
            <Input v-model.number="form.anio_publicacion" type="number" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label>Categoria *</Label>
            <Select v-model="form.categoria_id">
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="c in categorias" :key="c.id_categoria" :value="String(c.id_categoria)">
                  {{ c.nombre }} ({{ c.tipo }})
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="space-y-2">
            <Label>Editorial *</Label>
            <Select v-model="form.editorial_id">
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="e in editoriales" :key="e.id_editorial" :value="String(e.id_editorial)">
                  {{ e.nombre }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div class="space-y-2">
          <Label>Autores</Label>
          <select v-model="form.autores" multiple class="w-full h-20 rounded-md border border-input bg-background px-3 py-1 text-sm transition-colors duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none">
            <option v-for="a in autores" :key="a.id_autor" :value="a.id_autor">
              {{ a.nombre }}
            </option>
          </select>
        </div>

        <!-- Image upload -->
        <div class="space-y-2">
          <Label>Imagen del producto</Label>
          <div class="flex gap-2 mb-2">
            <Button
              type="button"
              :variant="imagenTab === 'url' ? 'default' : 'outline'"
              size="sm"
              class="transition-all duration-200"
              @click="imagenTab = 'url'"
            >
              URL
            </Button>
          </div>
          <Input v-if="imagenTab === 'url'" v-model="form.imagen_url" placeholder="https://..." />
          <div v-else>
            <Input type="file" accept="image/*" @change="handleFileUpload" />
            <p v-if="uploading" class="text-xs text-muted-foreground mt-1">Subiendo...</p>
          </div>
          <img v-if="form.imagen_url" :src="form.imagen_url" class="mt-2 h-24 w-24 object-cover rounded-md border" />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" class="transition-all duration-200 hover:bg-muted" @click="emit('cancel')">Cancelar</Button>
          <Button type="submit" class="transition-all duration-200 hover:scale-105 hover:shadow-md">Guardar</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
