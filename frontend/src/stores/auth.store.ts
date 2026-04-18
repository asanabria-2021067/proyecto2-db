import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../services/api'

interface User {
  id_usuario: number
  username: string
  rol: string
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') ?? '')
  const user = ref<User | null>(null)

  const isLoggedIn = computed(() => !!token.value)
  const rol = computed(() => user.value?.rol ?? '')

  if (token.value) {
    try {
      const parts = token.value.split('.')
      const payload = JSON.parse(atob(parts[1]!))
      user.value = { id_usuario: payload.id_usuario, username: payload.username, rol: payload.rol }
    } catch {
      token.value = ''
      localStorage.removeItem('token')
    }
  }

  async function login(username: string, password: string) {
    const res = await api.post('/auth/login', { username, password })
    token.value = res.data.token
    user.value = res.data.user
    localStorage.setItem('token', res.data.token)
  }

  function logout() {
    token.value = ''
    user.value = null
    localStorage.removeItem('token')
  }

  return { token, user, isLoggedIn, rol, login, logout }
})
