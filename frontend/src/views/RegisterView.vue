<script setup lang="ts">
import { computed, ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.store'
import api from '../services/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import gsap from 'gsap'

const router = useRouter()
const auth = useAuthStore()

const form = ref({
  username: '',
  password: '',
  confirmPassword: '',
  nombre: '',
  email: '',
  telefono: '',
  direccion: '',
})
const error = ref('')
const loading = ref(false)
const formRef = ref<HTMLElement>()
const illustrationRef = ref<HTMLElement>()
const productos = ref<any[]>([])

const coverImages = computed(() => {
  const fallback = 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=80'
  const urls = productos.value
    .map((p) => p.imagen_url)
    .filter((url): url is string => typeof url === 'string' && url.length > 0)
  return urls.length ? urls : [fallback]
})

async function loadProductos() {
  try {
    const res = await api.get('/productos')
    productos.value = res.data
  } catch {
    productos.value = []
  }
}

async function handleRegister() {
  error.value = ''
  if (!form.value.username || !form.value.password || !form.value.nombre) {
    error.value = 'Username, password y nombre son requeridos'
    return
  }
  if (form.value.password !== form.value.confirmPassword) {
    error.value = 'Las passwords no coinciden'
    return
  }
  if (form.value.password.length < 4) {
    error.value = 'La password debe tener al menos 4 caracteres'
    return
  }
  loading.value = true
  try {
    const res = await api.post('/auth/register', {
      username: form.value.username,
      password: form.value.password,
      nombre: form.value.nombre,
      email: form.value.email || undefined,
      telefono: form.value.telefono || undefined,
      direccion: form.value.direccion || undefined,
    })
    auth.token = res.data.token
    auth.user = res.data.user
    localStorage.setItem('token', res.data.token)
    router.push('/catalogo')
  } catch (err: any) {
    error.value = err.response?.data?.error ?? 'Error al registrar'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadProductos()
  await nextTick()

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

  tl.from(illustrationRef.value!, { x: -60, duration: 0.6 })
    .from(formRef.value!, { x: 60, duration: 0.6 }, '<0.1')
    .from('.register-field', { y: 20, duration: 0.3, stagger: 0.05 }, '-=0.3')
    .from('.register-btn', { y: 15, duration: 0.3 }, '-=0.1')
})
</script>

<template>
  <div class="min-h-screen flex">
    <!-- Left - Illustration -->
    <div
      ref="illustrationRef"
      class="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/20 flex-col items-center justify-center p-12 relative overflow-hidden"
    >
      <div class="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
      <div class="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-accent/15 blur-3xl" />

      <div class="relative z-10 h-full w-full text-center">
        <div class="mb-8 h-full w-full">
          <div class="grid h-full w-full grid-cols-6 gap-3 xl:grid-cols-7">
          <div
            v-for="(src, i) in coverImages"
            :key="i"
            class="aspect-[2/3] rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:scale-[1.03] hover:shadow-xl"
          >
            <img
              :src="src"
              alt="Cover"
              class="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        </div>
        </div>
        <h2 class="text-3xl font-bold text-foreground mb-4">Unete a la comunidad</h2>
        <p class="text-muted-foreground text-lg leading-relaxed">
          Registrate para acceder al catalogo completo, realizar compras y llevar un historial de tus lecturas favoritas.
        </p>
        <div class="mt-10 grid grid-cols-3 gap-4">
          <div class="p-3 rounded-xl bg-background/60 backdrop-blur border">
            <div class="text-xs text-muted-foreground">Catalogo completo</div>
          </div>
          <div class="p-3 rounded-xl bg-background/60 backdrop-blur border">
            <div class="text-xs text-muted-foreground">Compra facil</div>
          </div>
          <div class="p-3 rounded-xl bg-background/60 backdrop-blur border">
            <div class="text-xs text-muted-foreground">Tu historial</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right - Form -->
    <div class="flex-1 flex items-center justify-center p-6 sm:p-12">
      <div ref="formRef" class="w-full max-w-md">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-foreground">Crear cuenta</h1>
          <p class="text-muted-foreground mt-2">Completa tus datos para registrarte como cliente</p>
        </div>

        <form @submit.prevent="handleRegister" class="space-y-4">
          <div class="register-field grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="reg-username">Usuario *</Label>
              <Input id="reg-username" v-model="form.username" placeholder="Tu usuario" autofocus />
            </div>
            <div class="space-y-2">
              <Label for="reg-nombre">Nombre completo *</Label>
              <Input id="reg-nombre" v-model="form.nombre" placeholder="Juan Perez" />
            </div>
          </div>

          <div class="register-field grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="reg-password">Password *</Label>
              <Input id="reg-password" v-model="form.password" type="password" placeholder="Min. 4 caracteres" />
            </div>
            <div class="space-y-2">
              <Label for="reg-confirm">Confirmar password *</Label>
              <Input id="reg-confirm" v-model="form.confirmPassword" type="password" placeholder="Repetir password" />
            </div>
          </div>

          <div class="register-field space-y-2">
            <Label for="reg-email">Email</Label>
            <Input id="reg-email" v-model="form.email" type="email" placeholder="tu@email.com" />
          </div>

          <div class="register-field grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="reg-tel">Telefono</Label>
              <Input id="reg-tel" v-model="form.telefono" placeholder="5555-1234" />
            </div>
            <div class="space-y-2">
              <Label for="reg-dir">Direccion</Label>
              <Input id="reg-dir" v-model="form.direccion" placeholder="Zona 1, Guatemala" />
            </div>
          </div>

          <div v-if="error" class="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {{ error }}
          </div>

          <Button type="submit" class="register-btn w-full h-11 text-base transition-all duration-200 hover:scale-[1.02] hover:shadow-lg" :disabled="loading">
            {{ loading ? 'Registrando...' : 'Crear cuenta' }}
          </Button>

          <p class="text-center text-sm text-muted-foreground">
            Ya tienes cuenta?
            <router-link to="/login" class="text-primary font-medium hover:underline">Inicia sesion</router-link>
          </p>
          <Button
            type="button"
            variant="ghost"
            class="w-full text-muted-foreground transition-all duration-200 hover:bg-primary/5 hover:text-primary"
            @click="router.push('/')"
          >
            Volver a inicio
          </Button>
        </form>
      </div>
    </div>
  </div>
</template>
