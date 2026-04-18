<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import gsap from 'gsap'

const router = useRouter()
const auth = useAuthStore()

const features = [
  {
    icon: '📚',
    title: 'Catalogo Completo',
    desc: 'Navega entre libros, mangas, comics y revistas. Filtra por categoria, autor o editorial para encontrar exactamente lo que buscas.',
  },
  {
    icon: '🛒',
    title: 'Compra Facil',
    desc: 'Agrega productos a tu carrito y completa tu compra en pocos clics. Sistema de ventas con control de stock en tiempo real.',
  },
  {
    icon: '📊',
    title: 'Panel de Control',
    desc: 'Dashboard con reportes de ventas por mes, top productos, ranking de clientes y alertas de stock bajo. Exporta a CSV.',
  },
  {
    icon: '🔐',
    title: 'Multi-Rol',
    desc: 'Tres niveles de acceso: administradores con control total, vendedores para gestion diaria y clientes para compras online.',
  },
  {
    icon: '📦',
    title: 'Inventario Inteligente',
    desc: 'CRUD completo de productos con imagenes, categorias, editoriales y autores. Alerta automatica cuando el stock es bajo.',
  },
  {
    icon: '🧾',
    title: 'Transacciones Seguras',
    desc: 'Cada venta se procesa con transacciones SQL (BEGIN/COMMIT/ROLLBACK) garantizando integridad de datos y stock correcto.',
  },
]

const stats = [
  { value: '1000+', label: 'Productos en catalogo' },
  { value: '14', label: 'Tablas relacionales' },
  { value: '3', label: 'Roles de usuario' },
  { value: '100%', label: 'SQL nativo (sin ORM)' },
]

const steps = [
  { num: '01', title: 'Registrate', desc: 'Crea tu cuenta como cliente, vendedor o administrador.' },
  { num: '02', title: 'Explora', desc: 'Navega el catalogo, filtra por tipo, busca por titulo o autor.' },
  { num: '03', title: 'Compra', desc: 'Selecciona productos y registra tu venta con control de stock.' },
  { num: '04', title: 'Reportes', desc: 'Visualiza metricas, exporta datos y gestiona tu inventario.' },
]

const techStack = [
  { name: 'Vue.js 3', desc: 'Frontend reactivo', icon: '💚' },
  { name: 'TypeScript', desc: 'Tipado estricto', icon: '🔷' },
  { name: 'PostgreSQL', desc: 'Base de datos', icon: '🐘' },
  { name: 'Express.js', desc: 'API REST', icon: '⚡' },
  { name: 'Docker', desc: 'Contenedores', icon: '🐳' },
  { name: 'JWT', desc: 'Autenticacion', icon: '🔑' },
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

onMounted(() => {
  const tl = gsap.timeline({ defaults: { ease: 'power2.out' } })

  tl.from('.hero-badge', { y: -20, opacity: 0, duration: 0.25 })
    .from('.hero-title span', { y: 50, opacity: 0, duration: 0.35, stagger: 0.04 }, '-=0.1')
    .from('.hero-subtitle', { y: 25, opacity: 0, duration: 0.3 }, '-=0.15')
    .from('.hero-actions > *', { y: 20, opacity: 0, duration: 0.25, stagger: 0.05 }, '-=0.1')

  gsap.from('.stat-item', { y: 30, opacity: 0, duration: 0.3, stagger: 0.05, delay: 0.6 })
  gsap.from('.feature-card', { y: 40, opacity: 0, duration: 0.3, stagger: 0.04, delay: 0.8 })
  gsap.from('.step-item', { x: -30, opacity: 0, duration: 0.3, stagger: 0.06, delay: 1.0 })
  gsap.from('.tech-item', { scale: 0.8, opacity: 0, duration: 0.25, stagger: 0.04, delay: 1.2 })
  gsap.from('.cta-section', { y: 30, opacity: 0, duration: 0.3, delay: 1.4 })
})
</script>

<template>
  <div class="min-h-screen">
    <!-- Navbar mini for landing -->
    <header class="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div class="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <span class="flex items-center gap-2 text-lg font-bold">
          <span class="text-xl">📚</span>
          Tienda de Libros
        </span>
        <div class="flex items-center gap-3">
          <Button variant="ghost" size="sm" class="transition-all duration-200 hover:bg-accent/80" @click="goToCatalogo">
            Ver Catalogo
          </Button>
          <Button size="sm" class="transition-all duration-200 hover:scale-105 hover:shadow-md" @click="goToLogin">
            {{ auth.isLoggedIn ? 'Ir al Panel' : 'Iniciar Sesion' }}
          </Button>
        </div>
      </div>
    </header>

    <!-- Hero -->
    <section class="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/10 pt-16 pb-24 sm:pt-24 sm:pb-32">
      <div class="mx-auto max-w-4xl px-6 text-center">
        <div class="hero-badge mb-6 inline-flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground">
          <span class="relative flex h-2 w-2">
            <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
            <span class="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
          </span>
          Proyecto CC3088 - Bases de Datos 1, UVG
        </div>

        <h1 class="hero-title text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl leading-tight">
          <span class="inline-block">Tu&nbsp;</span>
          <span class="inline-block text-primary">tienda&nbsp;</span>
          <span class="inline-block">de&nbsp;</span>
          <span class="inline-block text-primary">libros&nbsp;</span>
          <span class="inline-block">y&nbsp;</span>
          <span class="inline-block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">mangas</span>
        </h1>

        <p class="hero-subtitle mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Plataforma fullstack para gestionar inventario y ventas de una tienda de libros y mangas.
          Funciona como tienda virtual para clientes y dashboard administrativo para empleados.
        </p>

        <div class="hero-actions mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" class="text-base px-8 transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-primary/25" @click="goToCatalogo">
            Explorar Catalogo
          </Button>
          <Button size="lg" variant="outline" class="text-base px-8 transition-all duration-200 hover:scale-105 hover:shadow-md hover:border-primary/50" @click="goToLogin">
            {{ auth.isLoggedIn ? 'Ir al Panel' : 'Iniciar Sesion' }}
          </Button>
        </div>
      </div>

      <!-- Decorative -->
      <div class="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-primary/8 blur-3xl pointer-events-none" />
      <div class="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-accent/15 blur-3xl pointer-events-none" />
    </section>

    <!-- Stats -->
    <section class="py-12 border-b bg-muted/30">
      <div class="mx-auto max-w-5xl px-6">
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-8">
          <div v-for="s in stats" :key="s.label" class="stat-item text-center">
            <div class="text-3xl font-extrabold text-primary">{{ s.value }}</div>
            <div class="mt-1 text-sm text-muted-foreground">{{ s.label }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="py-20 px-6">
      <div class="mx-auto max-w-6xl">
        <div class="text-center mb-14">
          <h2 class="text-3xl font-bold text-foreground">Funcionalidades completas</h2>
          <p class="mt-3 text-muted-foreground max-w-xl mx-auto">
            Todo lo que necesitas para gestionar una tienda de libros y mangas, desde el inventario hasta los reportes.
          </p>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card
            v-for="f in features"
            :key="f.title"
            class="feature-card group cursor-default border transition-all duration-250 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 hover:border-primary/30"
          >
            <CardContent class="pt-6 pb-5">
              <div class="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-2xl transition-transform duration-250 group-hover:scale-110 group-hover:bg-primary/15">
                {{ f.icon }}
              </div>
              <h3 class="font-semibold text-foreground mb-2 text-base transition-colors duration-200 group-hover:text-primary">{{ f.title }}</h3>
              <p class="text-sm text-muted-foreground leading-relaxed">{{ f.desc }}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>

    <Separator />

    <!-- How it works -->
    <section class="py-20 px-6 bg-muted/20">
      <div class="mx-auto max-w-4xl">
        <div class="text-center mb-14">
          <h2 class="text-3xl font-bold text-foreground">Como funciona</h2>
          <p class="mt-3 text-muted-foreground">Cuatro pasos simples para comenzar a usar la plataforma.</p>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div
            v-for="step in steps"
            :key="step.num"
            class="step-item group flex gap-4 p-5 rounded-xl border bg-card transition-all duration-250 hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5"
          >
            <div class="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm transition-transform duration-250 group-hover:scale-110">
              {{ step.num }}
            </div>
            <div>
              <h3 class="font-semibold text-foreground mb-1 transition-colors duration-200 group-hover:text-primary">{{ step.title }}</h3>
              <p class="text-sm text-muted-foreground leading-relaxed">{{ step.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <Separator />

    <!-- Tech stack -->
    <section class="py-20 px-6">
      <div class="mx-auto max-w-4xl">
        <div class="text-center mb-14">
          <h2 class="text-3xl font-bold text-foreground">Stack tecnologico</h2>
          <p class="mt-3 text-muted-foreground">Construido con tecnologias modernas y robustas.</p>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div
            v-for="tech in techStack"
            :key="tech.name"
            class="tech-item group flex flex-col items-center gap-2 p-4 rounded-xl border bg-card text-center transition-all duration-250 hover:shadow-md hover:border-primary/30 hover:-translate-y-1 hover:bg-primary/5"
          >
            <span class="text-2xl transition-transform duration-250 group-hover:scale-125">{{ tech.icon }}</span>
            <span class="text-sm font-semibold text-foreground transition-colors duration-200 group-hover:text-primary">{{ tech.name }}</span>
            <span class="text-xs text-muted-foreground">{{ tech.desc }}</span>
          </div>
        </div>
      </div>
    </section>

    <Separator />

    <!-- SQL features highlight -->
    <section class="py-20 px-6 bg-muted/20">
      <div class="mx-auto max-w-5xl">
        <div class="text-center mb-14">
          <h2 class="text-3xl font-bold text-foreground">SQL avanzado integrado</h2>
          <p class="mt-3 text-muted-foreground max-w-xl mx-auto">
            Todas las consultas corren desde la aplicacion web, no como scripts sueltos.
          </p>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div class="group p-5 rounded-xl border bg-card transition-all duration-250 hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5">
            <div class="text-xs font-bold text-primary uppercase tracking-wider mb-2">JOINs multiples</div>
            <p class="text-sm text-muted-foreground">Productos con categoria, editorial y autores. Ventas con cliente y empleado. Compras con proveedor y detalle.</p>
          </div>
          <div class="group p-5 rounded-xl border bg-card transition-all duration-250 hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5">
            <div class="text-xs font-bold text-primary uppercase tracking-wider mb-2">Subqueries</div>
            <p class="text-sm text-muted-foreground">Productos nunca vendidos (NOT EXISTS). Clientes que gastan mas que el promedio (subquery con AVG).</p>
          </div>
          <div class="group p-5 rounded-xl border bg-card transition-all duration-250 hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5">
            <div class="text-xs font-bold text-primary uppercase tracking-wider mb-2">GROUP BY + HAVING</div>
            <p class="text-sm text-muted-foreground">Top 10 mas vendidos, ventas por mes, categorias con mas de N productos.</p>
          </div>
          <div class="group p-5 rounded-xl border bg-card transition-all duration-250 hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5">
            <div class="text-xs font-bold text-primary uppercase tracking-wider mb-2">CTE (WITH)</div>
            <p class="text-sm text-muted-foreground">Ranking de clientes por total gastado usando Common Table Expressions.</p>
          </div>
          <div class="group p-5 rounded-xl border bg-card transition-all duration-250 hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5">
            <div class="text-xs font-bold text-primary uppercase tracking-wider mb-2">VIEW</div>
            <p class="text-sm text-muted-foreground">vista_producto_completo que une producto + categoria + editorial + autores. Usada por el backend.</p>
          </div>
          <div class="group p-5 rounded-xl border bg-card transition-all duration-250 hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5">
            <div class="text-xs font-bold text-primary uppercase tracking-wider mb-2">Transacciones</div>
            <p class="text-sm text-muted-foreground">BEGIN/COMMIT/ROLLBACK explicito al registrar ventas. Valida stock y revierte si es insuficiente.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="cta-section py-20 px-6 bg-gradient-to-br from-primary/10 via-background to-accent/10">
      <div class="mx-auto max-w-2xl text-center">
        <h2 class="text-3xl font-bold text-foreground mb-4">Listo para explorar?</h2>
        <p class="text-muted-foreground mb-8 leading-relaxed">
          Accede al catalogo sin cuenta o inicia sesion para gestionar inventario, ventas y reportes.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" class="text-base px-8 transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-primary/25" @click="goToCatalogo">
            Ver Catalogo
          </Button>
          <Button size="lg" variant="outline" class="text-base px-8 transition-all duration-200 hover:scale-105 hover:shadow-md hover:border-primary/50" @click="goToLogin">
            {{ auth.isLoggedIn ? 'Ir al Panel' : 'Iniciar Sesion' }}
          </Button>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="py-10 px-6 border-t bg-muted/30">
      <div class="mx-auto max-w-5xl text-center">
        <div class="flex items-center justify-center gap-2 mb-3">
          <span class="text-xl">📚</span>
          <span class="font-bold text-foreground">Tienda de Libros y Mangas</span>
        </div>
        <p class="text-sm text-muted-foreground">
          Proyecto CC3088 Bases de Datos 1 - Universidad del Valle de Guatemala
        </p>
        <p class="text-xs text-muted-foreground mt-2">
          Vue.js 3 + Express + PostgreSQL + Docker
        </p>
      </div>
    </footer>
  </div>
</template>
