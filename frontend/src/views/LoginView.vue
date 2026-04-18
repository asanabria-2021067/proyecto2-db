<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.store'

const auth = useAuthStore()
const router = useRouter()

const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

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
</script>

<template>
  <div class="login-wrapper">
    <div class="login-card">
      <h1>Tienda de Libros y Mangas</h1>
      <p class="subtitle">Inicia sesion para continuar</p>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="username">Usuario</label>
          <input id="username" v-model="username" type="text" placeholder="username" autofocus />
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input id="password" v-model="password" type="password" placeholder="password" />
        </div>
        <div v-if="error" class="error-msg">{{ error }}</div>
        <button type="submit" class="btn btn-primary" :disabled="loading">
          {{ loading ? 'Ingresando...' : 'Ingresar' }}
        </button>
      </form>
      <div class="login-hint">
        <small>Demo: admin/admin123 | vendedor1/vend123 | cliente1/cli123</small>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
}
.login-card {
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 2.5rem;
  width: 100%;
  max-width: 400px;
}
.login-card h1 {
  font-size: 1.4rem;
  margin-bottom: 0.25rem;
}
.subtitle {
  color: var(--color-text-muted);
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
}
.login-hint {
  margin-top: 1.25rem;
  text-align: center;
  color: var(--color-text-muted);
}
</style>
