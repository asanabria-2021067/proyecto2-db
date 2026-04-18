<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import gsap from 'gsap'

const auth = useAuthStore()
const router = useRouter()

const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const cardRef = ref<HTMLElement>()

async function handleLogin() {
  error.value = ''
  if (!username.value || !password.value) {
    error.value = 'Username y password son requeridos'
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
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  gsap.from(cardRef.value!, {
    y: 30,
    opacity: 0,
    duration: 0.3,
    ease: 'power2.out',
  })
})
</script>

<template>
  <div class="flex min-h-[80vh] items-center justify-center">
    <Card ref="cardRef" class="w-full max-w-sm">
      <CardHeader class="text-center">
        <CardTitle class="text-2xl">Tienda de Libros y Mangas</CardTitle>
        <CardDescription>Inicia sesion para continuar</CardDescription>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="handleLogin" class="space-y-4">
          <div class="space-y-2">
            <Label for="username">Usuario</Label>
            <Input id="username" v-model="username" type="text" placeholder="Tu usuario" autofocus />
          </div>
          <div class="space-y-2">
            <Label for="password">Password</Label>
            <Input id="password" v-model="password" type="password" placeholder="Tu password" />
          </div>
          <div v-if="error" class="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {{ error }}
          </div>
          <Button type="submit" class="w-full" :disabled="loading">
            {{ loading ? 'Ingresando...' : 'Ingresar' }}
          </Button>
        </form>
      </CardContent>
    </Card>
  </div>
</template>
