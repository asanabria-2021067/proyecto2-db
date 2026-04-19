<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api'
import { useAuthStore } from '../stores/auth.store'
import { useCartStore } from '../stores/cart.store'
import { ShoppingCart } from 'lucide-vue-next'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { useSuccess, useError } from '@/composables/useSwal'
import gsap from 'gsap'

const auth = useAuthStore()
const cart = useCartStore()
const router = useRouter()
const productos = ref<any[]>([])
const search = ref('')
const tipoFilter = ref('all')
const loading = ref(true)
async function load() {
  try {
    const res = await api.get('/productos')
    productos.value = res.data
    cart.syncStock(res.data)
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

async function agregarAlCarrito(producto: any) {
  if (producto.stock <= 0) {
    useError('Sin stock', 'Este producto esta agotado')
    return
  }
  cart.addItem(producto, 1)
  await useSuccess('Agregado', `"${producto.titulo}" se agrego al carrito`)
}

onMounted(async () => {
  await load()
  nextTick(() => {
    gsap.from('.catalog-item', {
      y: 30,
      duration: 0.35,
      stagger: 0.04,
      ease: 'power2.out',
    })
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
      <div class="flex items-center gap-2">
        <Button v-if="auth.rol === 'cliente'" variant="outline" size="sm" class="gap-2" @click="router.push('/carrito')">
          <ShoppingCart class="h-4 w-4" />
          Carrito ({{ cart.count }})
        </Button>
        <Button v-if="!auth.isLoggedIn" variant="outline" size="sm" @click="router.push('/')">
          Volver al inicio
        </Button>
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

    <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
      <div
        v-for="p in filtered"
        :key="p.id_producto"
        class="catalog-item group"
      >
        <!-- Cover image -->
        <div class="relative aspect-[2/3] rounded-xl overflow-hidden shadow-md transition-all duration-300 group-hover:shadow-xl group-hover:shadow-primary/15 group-hover:-translate-y-2">
          <img
            v-if="p.imagen_url"
            :src="p.imagen_url"
            :alt="p.titulo"
            class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
          <div
            v-else
            class="h-full w-full bg-gradient-to-br from-primary/20 via-accent/10 to-muted flex flex-col items-center justify-center gap-2"
          >
            <span class="text-xs text-muted-foreground font-medium px-3 text-center">{{ p.titulo }}</span>
          </div>

          <!-- Overlay on hover -->
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
            <p v-if="p.descripcion" class="text-white/80 text-xs line-clamp-3 mb-2">{{ p.descripcion }}</p>
            <div class="flex items-center justify-between">
              <span class="text-white font-bold text-lg">Q{{ Number(p.precio).toFixed(2) }}</span>
              <Button
                v-if="auth.isLoggedIn && auth.rol === 'cliente' && p.stock > 0"
                size="sm"
                class="h-7 text-xs transition-all duration-200 hover:scale-105"
                @click.stop="agregarAlCarrito(p)"
              >
                Agregar
              </Button>
            </div>
          </div>

          <!-- Stock badge -->
          <Badge
            :variant="p.stock <= 5 ? 'destructive' : 'secondary'"
            class="absolute top-2 right-2 text-[10px] opacity-90"
          >
            {{ p.stock > 0 ? `${p.stock} disp.` : 'Agotado' }}
          </Badge>

          <!-- Type badge -->
          <Badge
            variant="secondary"
            class="absolute top-2 left-2 text-[10px] bg-black/50 text-white border-0"
          >
            {{ p.tipo }}
          </Badge>
        </div>

        <!-- Minimal info below image -->
        <div class="mt-2.5 px-0.5">
          <h3 class="font-semibold text-sm text-foreground leading-tight line-clamp-2 transition-colors duration-200 group-hover:text-primary">{{ p.titulo }}</h3>
          <p v-if="p.autores" class="text-xs text-muted-foreground mt-0.5 truncate">{{ p.autores }}</p>
          <div class="flex items-center justify-between mt-1">
            <span class="text-sm font-bold text-primary">Q{{ Number(p.precio).toFixed(2) }}</span>
            <span class="text-[10px] text-muted-foreground">{{ p.editorial }}</span>
          </div>
        </div>
      </div>
    </div>

    <p v-if="!loading && filtered.length === 0" class="text-center py-16 text-muted-foreground">
      No se encontraron productos.
    </p>
  </div>
</template>
