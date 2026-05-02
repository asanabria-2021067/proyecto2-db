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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useSuccess, useError } from '@/composables/useSwal'
import gsap from 'gsap'

const auth = useAuthStore()
const cart = useCartStore()
const router = useRouter()
const productos = ref<any[]>([])
const search = ref('')
const tipoFilter = ref('all')
const loading = ref(true)
const selectedProduct = ref<any>(null)
const showDialog = ref(false)
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

function openProductDialog(producto: any) {
  selectedProduct.value = producto
  showDialog.value = true
}

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
        <div class="relative aspect-[2/3] rounded-xl overflow-hidden shadow-md transition-all duration-300 group-hover:shadow-xl group-hover:shadow-primary/15 group-hover:-translate-y-2 cursor-pointer" @click="openProductDialog(p)">
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

    <Dialog v-model:open="showDialog">
      <DialogContent class="max-w-3xl max-h-[100vh] overflow-y-auto">
        <DialogHeader v-if="selectedProduct">
          <DialogTitle class="text-xl font-bold">{{ selectedProduct.titulo }}</DialogTitle>
          <DialogDescription v-if="selectedProduct.autores" class="text-sm">
            por {{ selectedProduct.autores }}
          </DialogDescription>
        </DialogHeader>

        <div v-if="selectedProduct" class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <!-- Image -->
          <div class="aspect-[2/3] rounded-lg overflow-hidden shadow-lg">
            <img
              v-if="selectedProduct.imagen_url"
              :src="selectedProduct.imagen_url"
              :alt="selectedProduct.titulo"
              class="h-full w-full object-cover"
            />
            <div
              v-else
              class="h-full w-full bg-gradient-to-br from-primary/20 via-accent/10 to-muted flex items-center justify-center"
            >
              <span class="text-sm text-muted-foreground font-medium px-4 text-center">{{ selectedProduct.titulo }}</span>
            </div>
          </div>

          <!-- Details -->
          <div class="flex flex-col gap-4">
            <div>
              <h3 class="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">Detalles</h3>
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span class="text-sm text-muted-foreground">Tipo:</span>
                  <Badge variant="secondary">{{ selectedProduct.tipo }}</Badge>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-muted-foreground">Editorial:</span>
                  <span class="text-sm font-medium">{{ selectedProduct.editorial }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-muted-foreground">Categoria:</span>
                  <span class="text-sm font-medium">{{ selectedProduct.categoria }}</span>
                </div>
                <div v-if="selectedProduct.anio_publicacion" class="flex justify-between">
                  <span class="text-sm text-muted-foreground">Año:</span>
                  <span class="text-sm font-medium">{{ selectedProduct.anio_publicacion }}</span>
                </div>
                <div v-if="selectedProduct.isbn" class="flex justify-between">
                  <span class="text-sm text-muted-foreground">ISBN:</span>
                  <span class="text-sm font-mono text-xs">{{ selectedProduct.isbn }}</span>
                </div>
              </div>
            </div>

            <div v-if="selectedProduct.descripcion">
              <h3 class="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">Descripcion</h3>
              <p class="text-sm leading-relaxed">{{ selectedProduct.descripcion }}</p>
            </div>

            <div class="mt-auto pt-4 border-t">
              <div class="flex items-center justify-between mb-4">
                <div>
                  <p class="text-xs text-muted-foreground">Precio</p>
                  <p class="text-2xl font-bold text-primary">Q{{ Number(selectedProduct.precio).toFixed(2) }}</p>
                </div>
                <div class="text-right">
                  <p class="text-xs text-muted-foreground">Stock disponible</p>
                  <Badge :variant="selectedProduct.stock <= 5 ? 'destructive' : 'secondary'" class="text-sm">
                    {{ selectedProduct.stock > 0 ? `${selectedProduct.stock} unidades` : 'Agotado' }}
                  </Badge>
                </div>
              </div>

              <Button
                v-if="auth.isLoggedIn && auth.rol === 'cliente'"
                class="w-full transition-all duration-200 hover:scale-105"
                :disabled="selectedProduct.stock <= 0"
                @click="agregarAlCarrito(selectedProduct); showDialog = false"
              >
                <ShoppingCart class="h-4 w-4 mr-2" />
                {{ selectedProduct.stock > 0 ? 'Agregar al carrito' : 'Sin stock' }}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>
