<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import gsap from 'gsap'

const router = useRouter()
const auth = useAuthStore()

const coverImages = [
  { src: 'https://covers.openlibrary.org/b/isbn/9781569319208-L.jpg', title: 'Dragon Ball Vol. 1' },
  { src: 'https://covers.openlibrary.org/b/isbn/9781569319017-L.jpg', title: 'One Piece Vol. 1' },
  { src: 'https://covers.openlibrary.org/b/isbn/9781612620244-L.jpg', title: 'Shingeki no Kyojin' },
  { src: 'https://covers.openlibrary.org/b/isbn/9781593070205-L.jpg', title: 'Berserk Vol. 1' },
  { src: 'https://covers.openlibrary.org/b/isbn/9780747532699-L.jpg', title: 'Harry Potter' },
  { src: 'https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg', title: '1984' },
  { src: 'https://covers.openlibrary.org/b/isbn/9780553293357-L.jpg', title: 'Fundacion' },
  { src: 'https://covers.openlibrary.org/b/isbn/9781563893421-L.jpg', title: 'Batman DKR' },
]

const categories = [
  { label: 'Manga', desc: 'Shonen, Seinen, Shojo y mas. Las mejores series japonesas en un solo lugar.', tipo: 'MANGA' },
  { label: 'Libros', desc: 'Fantasia, ciencia ficcion, clasicos y novedades. Historias que inspiran.', tipo: 'LIBRO' },
  { label: 'Comics', desc: 'Superheroes, novelas graficas e historias independientes de todo el mundo.', tipo: 'COMIC' },
  { label: 'Revistas', desc: 'Divulgacion, cultura pop y ediciones especiales para coleccionistas.', tipo: 'REVISTA' },
]

const highlights = [
  { title: 'Nuevos titulos cada semana', desc: 'Actualizamos el catalogo con los volumenes mas recientes de tus series favoritas.' },
  { title: 'Precios accesibles', desc: 'Ofrecemos los mejores precios en mangas, libros y comics para toda la comunidad.' },
  { title: 'Stock en tiempo real', desc: 'Consulta la disponibilidad al instante. Si esta en el catalogo, lo tenemos para ti.' },
]

function goToLogin() {
  if (auth.isLoggedIn) {
    router.push(auth.rol === 'cliente' ? '/catalogo' : '/dashboard')
  } else {
    router.push('/login')
  }
}

function goToCatalogo() {
  router.push('/catalogo')
}

function goToRegister() {
  router.push('/register')
}

onMounted(() => {
  const tl = gsap.timeline({ defaults: { ease: 'power2.out' } })

  tl.from('.hero-title span', { y: 50, duration: 0.4, stagger: 0.05 }, 0)
    .from('.hero-subtitle', { y: 25, duration: 0.3 }, '-=0.15')
    .from('.hero-actions > *', { y: 20, duration: 0.25, stagger: 0.05 }, '-=0.1')

  gsap.from('.hero-cover', { y: 40, scale: 0.9, duration: 0.5, stagger: 0.06, delay: 0.3 })
  gsap.from('.cat-card', { y: 30, duration: 0.35, stagger: 0.06, delay: 0.6 })
  gsap.from('.highlight-item', { x: -20, duration: 0.3, stagger: 0.08, delay: 0.8 })
  gsap.from('.cta-section', { y: 20, duration: 0.3, delay: 1.0 })

  gsap.to('.hero-cover', {
    y: -6,
    duration: 2.5,
    ease: 'sine.inOut',
    repeat: -1,
    yoyo: true,
    stagger: { each: 0.3 },
  })
})
</script>

<template>
  <div class="min-h-screen">
    <!-- Navbar -->
    <header class="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div class="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <span class="text-lg font-bold">Tienda de Libros y Mangas</span>
        <div class="flex items-center gap-3">
          <Button variant="ghost" size="sm" @click="goToCatalogo">Ver Catalogo</Button>
          <Button v-if="!auth.isLoggedIn" variant="outline" size="sm" @click="goToRegister">Registrarse</Button>
          <Button size="sm" @click="goToLogin">
            {{ auth.isLoggedIn ? 'Ir al Panel' : 'Iniciar Sesion' }}
          </Button>
        </div>
      </div>
    </header>

    <!-- Hero con portadas -->
    <section class="relative overflow-hidden pt-16 pb-8 sm:pt-24 sm:pb-12">
      <div class="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-primary/8 blur-3xl pointer-events-none" />
      <div class="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-accent/15 blur-3xl pointer-events-none" />

      <div class="mx-auto max-w-6xl px-6">
        <div class="grid lg:grid-cols-2 gap-12 items-center">
          <!-- Text -->
          <div>
            <h1 class="hero-title text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl leading-[1.1]">
              <span class="inline-block">Descubre&nbsp;</span>
              <span class="inline-block">tu&nbsp;</span>
              <span class="inline-block text-primary">proxima&nbsp;</span>
              <span class="inline-block text-primary">gran&nbsp;</span>
              <span class="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">aventura</span>
            </h1>

            <p class="hero-subtitle mt-6 text-lg text-muted-foreground leading-relaxed max-w-lg">
              Mangas, libros, comics y revistas en un solo lugar.
              Desde los clasicos de siempre hasta los lanzamientos mas recientes.
            </p>

            <div class="hero-actions mt-8 flex flex-wrap gap-4">
              <Button size="lg" class="text-base px-8 transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-primary/25" @click="goToCatalogo">
                Explorar Catalogo
              </Button>
              <Button v-if="!auth.isLoggedIn" size="lg" variant="outline" class="text-base px-8 transition-all duration-200 hover:scale-105" @click="goToRegister">
                Crear cuenta gratis
              </Button>
            </div>
          </div>

          <!-- Cover collage -->
          <div class="hidden lg:block">
            <div class="grid grid-cols-4 gap-3">
              <div
                v-for="(cover, i) in coverImages"
                :key="i"
                class="hero-cover aspect-[2/3] rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:-translate-y-1"
              >
                <img :src="cover.src" :alt="cover.title" class="h-full w-full object-cover" loading="lazy" />
              </div>
            </div>
          </div>
        </div>

        <!-- Mobile cover strip -->
        <div class="lg:hidden mt-10 flex gap-3 overflow-x-auto pb-4 -mx-6 px-6 snap-x">
          <div
            v-for="(cover, i) in coverImages"
            :key="i"
            class="hero-cover flex-shrink-0 w-28 aspect-[2/3] rounded-xl overflow-hidden shadow-lg snap-start"
          >
            <img :src="cover.src" :alt="cover.title" class="h-full w-full object-cover" loading="lazy" />
          </div>
        </div>
      </div>
    </section>

    <Separator />

    <!-- Categorias -->
    <section class="py-20 px-6">
      <div class="mx-auto max-w-5xl">
        <div class="text-center mb-14">
          <h2 class="text-3xl font-bold text-foreground">Explora por categoria</h2>
          <p class="mt-3 text-muted-foreground max-w-lg mx-auto">
            Tenemos algo para cada lector. Encuentra tu genero favorito y empieza a coleccionar.
          </p>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div
            v-for="cat in categories"
            :key="cat.tipo"
            class="cat-card group p-6 rounded-2xl border bg-card transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1.5 hover:border-primary/30"
            @click="goToCatalogo"
          >
            <Badge variant="secondary" class="mb-3 text-xs transition-colors duration-200 group-hover:bg-primary/10 group-hover:text-primary">{{ cat.tipo }}</Badge>
            <h3 class="text-xl font-bold text-foreground mb-2 transition-colors duration-200 group-hover:text-primary">{{ cat.label }}</h3>
            <p class="text-sm text-muted-foreground leading-relaxed">{{ cat.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <Separator />

    <!-- Destacados / shelf -->
    <section class="py-20 px-6 bg-muted/20">
      <div class="mx-auto max-w-5xl">
        <div class="text-center mb-14">
          <h2 class="text-3xl font-bold text-foreground">Por que elegirnos</h2>
          <p class="mt-3 text-muted-foreground">Nos apasionan los libros y mangas tanto como a ti.</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div
            v-for="h in highlights"
            :key="h.title"
            class="highlight-item group p-6 rounded-2xl border bg-card transition-all duration-300 hover:shadow-lg hover:border-primary/30 hover:-translate-y-1"
          >
            <h3 class="font-bold text-foreground mb-2 transition-colors duration-200 group-hover:text-primary">{{ h.title }}</h3>
            <p class="text-sm text-muted-foreground leading-relaxed">{{ h.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <Separator />

    <!-- Featured covers showcase -->
    <section class="py-20 px-6">
      <div class="mx-auto max-w-6xl">
        <div class="text-center mb-14">
          <h2 class="text-3xl font-bold text-foreground">Titulos populares</h2>
          <p class="mt-3 text-muted-foreground">Algunos de los favoritos de nuestros lectores.</p>
        </div>
        <div class="flex justify-center gap-5 flex-wrap">
          <div
            v-for="(cover, i) in coverImages"
            :key="'shelf-' + i"
            class="group w-36 transition-all duration-300 hover:-translate-y-2"
            @click="goToCatalogo"
          >
            <div class="aspect-[2/3] rounded-xl overflow-hidden shadow-md transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-primary/20">
              <img :src="cover.src" :alt="cover.title" class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
            </div>
            <p class="mt-2 text-xs text-center text-muted-foreground font-medium truncate transition-colors duration-200 group-hover:text-primary">{{ cover.title }}</p>
          </div>
        </div>
      </div>
    </section>

    <Separator />

    <!-- CTA -->
    <section class="cta-section py-20 px-6 bg-gradient-to-br from-primary/10 via-background to-accent/10">
      <div class="mx-auto max-w-2xl text-center">
        <h2 class="text-3xl font-bold text-foreground mb-4">Empieza a leer hoy</h2>
        <p class="text-muted-foreground mb-8 leading-relaxed">
          Crea tu cuenta gratuita y accede a todo nuestro catalogo de libros, mangas, comics y revistas.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" class="text-base px-8 transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-primary/25" @click="goToCatalogo">
            Ver Catalogo
          </Button>
          <Button v-if="!auth.isLoggedIn" size="lg" variant="outline" class="text-base px-8 transition-all duration-200 hover:scale-105" @click="goToRegister">
            Registrarse gratis
          </Button>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="py-10 px-6 border-t bg-muted/30">
      <div class="mx-auto max-w-5xl text-center">
        <span class="font-bold text-foreground">Tienda de Libros y Mangas</span>
        <p class="text-xs text-muted-foreground mt-2">
          Tu destino para mangas, libros, comics y revistas
        </p>
      </div>
    </footer>
  </div>
</template>
