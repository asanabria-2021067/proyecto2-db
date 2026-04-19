<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import api from '@/services/api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import gsap from 'gsap'

const router = useRouter()
const auth = useAuthStore()
const rootRef = ref<HTMLElement>()
const productos = ref<any[]>([])
let ctx: gsap.Context | undefined

const categoryImages: Record<string, string> = {
  MANGA: 'https://images.unsplash.com/photo-1613376023733-0a73315d9b06?auto=format&fit=crop&w=1400&q=80',
  COMIC: 'https://images.unsplash.com/photo-1629992101753-56d196c8aabb?auto=format&fit=crop&w=1400&q=80',
  LIBRO: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=1400&q=80',
  REVISTA: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1400&q=80',
}

const featured = computed(() =>
  productos.value
    .filter((p) => Number(p.stock) > 0)
    .slice(0, 6),
)

const heroImages = computed(() => {
  const fallback = 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=80'
  const first = featured.value[0]?.imagen_url || fallback
  const second = featured.value[1]?.imagen_url || first
  const third = featured.value[2]?.imagen_url || second
  return { first, second, third }
})

const categories = computed(() => {
  const map = new Map<string, { tipo: string; nombre: string; total: number; image: string }>()
  for (const p of productos.value) {
    const key = `${p.tipo}-${p.categoria}`
    const found = map.get(key)
    if (found) {
      found.total += 1
    } else {
      map.set(key, {
        tipo: String(p.tipo ?? 'GENERAL'),
        nombre: String(p.categoria ?? 'Categoria'),
        total: 1,
        image:
          categoryImages[String(p.tipo ?? '')] ||
          categoryImages.LIBRO ||
          'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1400&q=80',
      })
    }
  }
  return Array.from(map.values()).slice(0, 6)
})

async function load() {
  try {
    const res = await api.get('/productos')
    productos.value = res.data
  } catch {
    productos.value = []
  }
}

function goPanel() {
  if (auth.isLoggedIn) {
    router.push(auth.rol === 'cliente' ? '/catalogo' : '/dashboard')
    return
  }
  router.push('/login')
}

onMounted(async () => {
  await load()
  await nextTick()
  if (!rootRef.value) return
  ctx = gsap.context(() => {
    gsap.from('.landing-enter', {
      y: 20,
      duration: 0.35,
      stagger: 0.05,
      ease: 'power2.out',
      clearProps: 'transform,opacity',
    })
    gsap.from('.landing-card', {
      y: 22,
      duration: 0.35,
      stagger: 0.05,
      delay: 0.2,
      ease: 'power2.out',
      clearProps: 'transform,opacity',
    })
  }, rootRef.value)
})

onUnmounted(() => ctx?.revert())
</script>

<template>
  <div ref="rootRef" class="min-h-screen bg-background text-foreground">
    <section class="relative overflow-hidden px-6 pb-20 pt-16">
      <div class="pointer-events-none absolute -left-24 top-8 h-60 w-60 rounded-full bg-primary/15 blur-3xl" />
      <div class="pointer-events-none absolute -right-24 top-24 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />

      <div class="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.2fr_0.8fr]">
        <div class="landing-enter">
          <h1 class="font-heading text-6xl font-black italic leading-[0.9] tracking-tight sm:text-8xl lg:text-9xl">
            LIBERA
            <br />
            TU PROXIMA
            <br />
            <span class="text-primary">AVENTURA</span>
          </h1>
          <p class="mt-7 max-w-xl text-base font-medium leading-relaxed text-muted-foreground sm:text-lg">
            Tienda de Libros y mangas: descubre lanzamientos, clasicos y coleccionables en un solo lugar.
            Compra facil, carrito claro y seguimiento de tus pedidos.
          </p>
          <div class="mt-9 flex flex-wrap gap-3">
            <Button class="h-12 rounded-xl px-7 text-base font-black active:scale-[0.98]" @click="router.push('/catalogo')">
              Explorar catalogo
            </Button>
            <Button variant="secondary" class="h-12 rounded-xl px-7 text-base font-bold active:scale-[0.98]" @click="goPanel">
              {{ auth.isLoggedIn ? 'Ir al panel' : 'Iniciar sesion' }}
            </Button>
            <Button v-if="!auth.isLoggedIn" variant="outline" class="h-12 rounded-xl px-7 text-base font-bold active:scale-[0.98]" @click="router.push('/register')">
              Registrarse
            </Button>
          </div>
        </div>

        <div class="landing-enter relative hidden h-[560px] lg:block">
          <div class="absolute inset-0 -rotate-3 overflow-hidden rounded-[2rem] bg-card shadow-xl">
            <img :src="heroImages.first" alt="Portada principal" class="h-full w-full object-cover brightness-75" />
          </div>
          <div class="absolute -right-8 -top-8 h-88 w-60 rotate-6 overflow-hidden rounded-xl bg-card shadow-2xl">
            <img :src="heroImages.second" alt="Portada secundaria" class="h-full w-full object-cover" />
          </div>
          <div class="absolute -bottom-6 -left-8 flex h-72 w-52 -rotate-12 items-center justify-center rounded-xl bg-sky-200 p-6 text-center text-slate-900 shadow-2xl">
            <span class="font-heading text-3xl font-black italic leading-tight">NOVEDADES DE LA TIENDA</span>
          </div>
        </div>
      </div>
    </section>

    <section class="bg-muted/30 py-20">
      <div class="mx-auto mb-10 flex max-w-7xl items-end justify-between gap-4 px-6">
        <div>
          <h2 class="font-heading text-4xl font-black tracking-tight sm:text-5xl">Novedades Destacadas</h2>
          <p class="mt-2 text-sm text-muted-foreground">Productos recientes disponibles actualmente en la tienda.</p>
          <div class="mt-4 h-1.5 w-32 bg-primary" />
        </div>
      </div>
      <div class="mx-auto grid max-w-7xl gap-7 px-6 md:grid-cols-2 xl:grid-cols-3">
        <article
          v-for="item in featured"
          :key="item.id_producto"
          class="landing-card group rounded-2xl border bg-card p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
        >
          <div class="aspect-[3/4] overflow-hidden rounded-xl bg-muted">
            <img
              :src="item.imagen_url || 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=80'"
              :alt="item.titulo"
              class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          <h3 class="mt-4 font-heading text-2xl font-bold">{{ item.titulo }}</h3>
          <p class="text-sm font-medium text-muted-foreground">{{ item.autores || 'Autor no disponible' }}</p>
          <p class="mt-1 text-xs font-semibold uppercase tracking-wide text-primary">{{ item.tipo }} · {{ item.categoria }}</p>
          <div class="mt-4 flex items-center justify-between">
            <span class="font-heading text-2xl font-black text-primary">Q{{ Number(item.precio).toFixed(2) }}</span>
            <Button size="sm" class="rounded-lg font-bold active:scale-[0.98]" @click="router.push('/catalogo')">Ver</Button>
          </div>
        </article>
      </div>
    </section>

    <section class="bg-background px-6 py-20">
      <div class="mx-auto max-w-7xl">
        <h2 class="mb-10 text-center font-heading text-5xl font-black tracking-tight">Categorias de la Tienda</h2>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
          <article
            v-for="cat in categories"
            :key="`${cat.tipo}-${cat.nombre}`"
            class="landing-card group relative overflow-hidden rounded-2xl border bg-card"
          >
            <img :src="cat.image" :alt="cat.nombre" class="h-56 w-full object-cover brightness-75 transition-transform duration-500 group-hover:scale-105" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div class="absolute inset-x-0 bottom-0 p-5 text-white">
              <p class="text-[11px] font-black tracking-wider text-white/80">{{ cat.tipo }}</p>
              <h3 class="font-heading text-2xl font-black">{{ cat.nombre }}</h3>
              <p class="text-xs text-white/85">{{ cat.total }} productos disponibles</p>
            </div>
          </article>
        </div>
      </div>
    </section>

    <section class="px-6 py-12">
      <div class="mx-auto max-w-7xl rounded-[2rem] bg-primary/25 p-10 md:p-16">
        <Badge class="mb-6 bg-white px-4 py-1 text-xs font-black tracking-widest text-black">PROMOCION DE LA TIENDA</Badge>
        <h3 class="max-w-3xl font-heading text-5xl font-black leading-[0.9] tracking-tight text-black md:text-7xl">
          LLEVA 3 Y
          <br />
          PAGA SOLO 2
        </h3>
        <p class="mt-6 max-w-xl text-base font-semibold text-black/80">
          Promocion especial de la tienda en seleccion de mangas.
          Aprovecha para completar colecciones con mejor precio.
        </p>
        <Button class="mt-8 h-12 rounded-xl bg-black px-8 font-black text-white hover:bg-black/90 active:scale-[0.98]" @click="router.push('/catalogo')">
          Comprar oferta
        </Button>
      </div>
    </section>
  </div>
</template>
