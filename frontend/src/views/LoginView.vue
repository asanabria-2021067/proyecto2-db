<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import gsap from 'gsap'

const auth = useAuthStore()
const router = useRouter()

const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const formRef = ref<HTMLElement>()
const illustrationRef = ref<HTMLElement>()

async function handleLogin() {
  error.value = ''
  if (!username.value || !password.value) {
    error.value = 'Username y password son requeridos'
    gsap.fromTo('.login-error', { x: -8 }, { x: 0, duration: 0.4, ease: 'elastic.out(1, 0.3)' })
    return
  }
  loading.value = true
  try {
    await auth.login(username.value, password.value)
    if (auth.rol === 'cliente') {
      router.push('/catalogo')
    } else {
      router.push('/dashboard')
    }
  } catch {
    error.value = 'Credenciales invalidas'
    gsap.fromTo('.login-error', { x: -8 }, { x: 0, duration: 0.4, ease: 'elastic.out(1, 0.3)' })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

  tl.from(illustrationRef.value!, { x: -80, opacity: 0, duration: 0.7 })
    .from(formRef.value!, { x: 60, opacity: 0, duration: 0.6 }, '<0.15')
    .from('.login-title', { y: 25, opacity: 0, duration: 0.4 }, '-=0.3')
    .from('.login-subtitle', { y: 15, opacity: 0, duration: 0.3 }, '-=0.2')
    .from('.login-field', { y: 20, opacity: 0, duration: 0.3, stagger: 0.08 }, '-=0.15')
    .from('.login-btn', { y: 15, opacity: 0, duration: 0.3 }, '-=0.1')
    .from('.login-footer', { opacity: 0, duration: 0.3 }, '-=0.1')

  gsap.to('.float-book', {
    y: -12,
    duration: 2.5,
    ease: 'sine.inOut',
    repeat: -1,
    yoyo: true,
    stagger: { each: 0.4 },
  })
})
</script>

<template>
  <div class="min-h-screen flex">
    <!-- Left - Branding & Illustration -->
    <div
      ref="illustrationRef"
      class="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/20 flex-col items-center justify-center p-12 relative overflow-hidden"
    >
      <div class="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
      <div class="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-accent/15 blur-3xl" />
      <div class="absolute top-1/4 right-1/4 h-32 w-32 rounded-full bg-primary/5 blur-2xl" />

      <div class="relative z-10 text-center max-w-lg">
        <div class="flex items-center justify-center gap-6 mb-10">
          <span class="float-book text-6xl">📚</span>
          <span class="float-book text-5xl">📖</span>
          <span class="float-book text-6xl">📕</span>
        </div>

        <h2 class="text-4xl font-extrabold text-foreground mb-4 leading-tight">
          Tienda de Libros<br/>
          <span class="text-primary">y Mangas</span>
        </h2>
        <p class="text-muted-foreground text-lg leading-relaxed">
          Explora nuestro catalogo de libros, mangas, comics y revistas.
          Gestiona inventario, ventas y reportes desde un solo lugar.
        </p>

        <div class="mt-12 flex justify-center gap-8">
          <div class="text-center">
            <div class="text-3xl font-bold text-primary">1000+</div>
            <div class="text-xs text-muted-foreground mt-1">Productos</div>
          </div>
          <div class="h-12 w-px bg-border" />
          <div class="text-center">
            <div class="text-3xl font-bold text-primary">3</div>
            <div class="text-xs text-muted-foreground mt-1">Roles</div>
          </div>
          <div class="h-12 w-px bg-border" />
          <div class="text-center">
            <div class="text-3xl font-bold text-primary">14</div>
            <div class="text-xs text-muted-foreground mt-1">Tablas SQL</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right - Login Form -->
    <div class="flex-1 flex items-center justify-center p-6 sm:p-12">
      <div ref="formRef" class="w-full max-w-sm">
        <!-- Mobile logo -->
        <div class="lg:hidden text-center mb-8">
          <span class="text-5xl">📚</span>
          <h2 class="text-xl font-bold text-foreground mt-2">Tienda de Libros y Mangas</h2>
        </div>

        <h1 class="login-title text-3xl font-bold text-foreground">Bienvenido</h1>
        <p class="login-subtitle text-muted-foreground mt-2 mb-8">Inicia sesion para continuar</p>

        <form @submit.prevent="handleLogin" class="space-y-5">
          <div class="login-field space-y-2">
            <Label for="username" class="text-sm font-medium">Usuario</Label>
            <Input
              id="username"
              v-model="username"
              type="text"
              placeholder="Tu nombre de usuario"
              autofocus
              class="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div class="login-field space-y-2">
            <Label for="password" class="text-sm font-medium">Password</Label>
            <Input
              id="password"
              v-model="password"
              type="password"
              placeholder="Tu password"
              class="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div v-if="error" class="login-error rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive border border-destructive/20">
            {{ error }}
          </div>

          <Button
            type="submit"
            class="login-btn w-full h-11 text-base font-medium transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/25"
            :disabled="loading"
          >
            {{ loading ? 'Ingresando...' : 'Iniciar sesion' }}
          </Button>

          <div class="login-footer space-y-3">
            <p class="text-center text-sm text-muted-foreground">
              No tienes cuenta?
              <router-link to="/register" class="text-primary font-medium hover:underline">Registrate</router-link>
            </p>

            <div class="flex items-center gap-3">
              <div class="flex-1 h-px bg-border" />
              <span class="text-xs text-muted-foreground">o</span>
              <div class="flex-1 h-px bg-border" />
            </div>

            <Button
              type="button"
              variant="outline"
              class="w-full transition-all duration-200 hover:bg-accent/50"
              @click="router.push('/catalogo')"
            >
              Explorar catalogo sin cuenta
            </Button>
          </div>
        </form>

        <!-- Credentials hint -->
        <div class="mt-8 p-3 rounded-lg bg-muted/50 border text-xs text-muted-foreground">
          <p class="font-medium mb-1">Cuentas de prueba:</p>
          <p>Admin: <code class="bg-muted px-1 rounded">admin</code> / <code class="bg-muted px-1 rounded">admin123</code></p>
          <p>Vendedor: <code class="bg-muted px-1 rounded">vendedor1</code> / <code class="bg-muted px-1 rounded">vend123</code></p>
          <p>Cliente: <code class="bg-muted px-1 rounded">cliente1</code> / <code class="bg-muted px-1 rounded">cli123</code></p>
        </div>
      </div>
    </div>
  </div>
</template>
