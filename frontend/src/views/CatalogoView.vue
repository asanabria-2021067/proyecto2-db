<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import api from '../services/api'
import { useAuthStore } from '../stores/auth.store'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { useConfirm, useSuccess, useError } from '@/composables/useSwal'
import gsap from 'gsap'

const auth = useAuthStore()
const productos = ref<any[]>([])
const search = ref('')
const tipoFilter = ref('all')
const loading = ref(true)
const buying = ref<number | null>(null)

async function load() {
  try {
    const res = await api.get('/productos')
    productos.value = res.data
  } catch {
    // ignore
  } finally {
    loading.value = false
  }
}

const filtered = computed(() => {
  let list = productos.value
  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter((p: any) =>
      p.titulo.toLowerCase().includes(q) ||
      (p.autores ?? '').toLowerCase().includes(q)
    )
  }
  if (tipoFilter.value && tipoFilter.value !== 'all') {
    list = list.filter((p: any) => p.tipo === tipoFilter.value)
  }
  return list
})

const tipos = computed(() => [...new Set(productos.value.map((p: any) => p.tipo))])

async function comprar(producto: any) {
  if (!auth.isLoggedIn) {
    useError('Inicia sesion', 'Debes iniciar sesion para comprar')
    return
  }
  const result = await useConfirm({
    title: 'Confirmar compra',
    text: `Comprar "${producto.titulo}" por Q${Number(producto.precio).toFixed(2)}?`,
    icon: 'question',
    confirmText: 'Comprar',
  })
  if (!result.isConfirmed) return

  buying.value = producto.id_producto
  try {
    await api.post('/ventas', {
      items: [{
        producto_id: producto.id_producto,
        cantidad: 1,
        precio_unitario: Number(producto.precio),
      }],
    })
    await useSuccess('Compra exitosa', `"${producto.titulo}" se agrego a tus compras`)
    await load()
  } catch (err: any) {
    useError('Error', err.response?.data?.error ?? 'No se pudo completar la compra')
  } finally {
    buying.value = null
  }
}

onMounted(async () => {
  await load()
  gsap.from('.catalog-item', {
    y: 25,
    opacity: 0,
    duration: 0.25,
    stagger: 0.03,
    ease: 'power2.out',
  })
})
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <h1 class="text-2xl font-bold">Catalogo</h1>
        <Badge variant="secondary" class="text-xs">{{ filtered.length }} productos</Badge>
      </div>
    </div>

    <div class="flex gap-3 mb-6">
      <Input v-model="search" placeholder="Buscar por titulo o autor..." class="flex-1 transition-all duration-200 focus:ring-2 focus:ring-primary/20" />
      <Select v-model="tipoFilter">
        <SelectTrigger class="w-48">
          <SelectValue placeholder="Todos los tipos" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los tipos</SelectItem>
          <SelectItem v-for="t in tipos" :key="t" :value="t">{{ t }}</SelectItem>
        </SelectContent>
      </Select>
    </div>

    <div v-if="loading" class="text-center py-16 text-muted-foreground">Cargando catalogo...</div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      <Card
        v-for="p in filtered"
        :key="p.id_producto"
        class="catalog-item group overflow-hidden flex flex-col border transition-all duration-250 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1.5 hover:border-primary/30"
      >
        <div v-if="p.imagen_url" class="aspect-[3/4] overflow-hidden bg-muted">
          <img
            :src="p.imagen_url"
            :alt="p.titulo"
            class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div v-else class="aspect-[3/4] bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center text-5xl text-muted-foreground/50 transition-all duration-300 group-hover:from-primary/5 group-hover:to-accent/5">
          📖
        </div>
        <CardContent class="pt-4 flex-1">
          <Badge variant="secondary" class="mb-2 transition-colors duration-200 group-hover:bg-primary/10 group-hover:text-primary">{{ p.tipo }}</Badge>
          <h3 class="font-semibold text-foreground leading-tight transition-colors duration-200 group-hover:text-primary">{{ p.titulo }}</h3>
          <p class="text-xs text-muted-foreground mt-1">{{ p.editorial }} | {{ p.categoria }}</p>
          <p v-if="p.autores" class="text-xs text-muted-foreground italic mt-1">{{ p.autores }}</p>
          <p v-if="p.descripcion" class="text-xs text-muted-foreground mt-2 line-clamp-2">{{ p.descripcion }}</p>
        </CardContent>
        <CardFooter class="flex justify-between items-center border-t pt-3 transition-colors duration-200 group-hover:bg-muted/30">
          <div>
            <span class="text-lg font-bold text-primary">Q{{ Number(p.precio).toFixed(2) }}</span>
            <Badge
              :variant="p.stock <= 5 ? 'destructive' : 'outline'"
              class="text-xs ml-2"
            >
              {{ p.stock > 0 ? `${p.stock} disp.` : 'Agotado' }}
            </Badge>
          </div>
          <Button
            v-if="auth.isLoggedIn && auth.rol === 'cliente' && p.stock > 0"
            size="sm"
            class="transition-all duration-200 hover:scale-105 hover:shadow-md"
            :disabled="buying === p.id_producto"
            @click="comprar(p)"
          >
            {{ buying === p.id_producto ? 'Comprando...' : 'Comprar' }}
          </Button>
          <Badge v-else-if="p.stock === 0" variant="destructive" class="text-xs">Agotado</Badge>
        </CardFooter>
      </Card>
    </div>

    <p v-if="!loading && filtered.length === 0" class="text-center py-16 text-muted-foreground">
      No se encontraron productos.
    </p>
  </div>
</template>
