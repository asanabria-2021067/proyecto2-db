<script setup lang="ts">
import { useAuthStore } from '../stores/auth.store'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

function logout() {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <nav class="navbar">
    <div class="navbar-inner">
      <RouterLink to="/dashboard" class="navbar-brand">Tienda de Libros</RouterLink>
      <div class="navbar-links">
        <template v-if="auth.rol === 'admin' || auth.rol === 'vendedor'">
          <RouterLink to="/dashboard">Dashboard</RouterLink>
          <RouterLink to="/productos">Productos</RouterLink>
          <RouterLink to="/clientes">Clientes</RouterLink>
          <RouterLink to="/ventas">Ventas</RouterLink>
        </template>
        <RouterLink to="/catalogo">Catalogo</RouterLink>
      </div>
      <div class="navbar-user">
        <span>{{ auth.user?.username }} ({{ auth.rol }})</span>
        <button class="btn btn-sm" @click="logout">Salir</button>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  background: var(--color-primary);
  color: #fff;
  padding: 0 1.5rem;
  margin-bottom: 1.5rem;
}
.navbar-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 2rem;
  height: 56px;
}
.navbar-brand {
  font-weight: 700;
  font-size: 1.1rem;
  color: #fff !important;
  text-decoration: none;
}
.navbar-links {
  display: flex;
  gap: 1rem;
  flex: 1;
}
.navbar-links a {
  color: rgba(255,255,255,0.85);
  text-decoration: none;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
}
.navbar-links a:hover,
.navbar-links a.router-link-active {
  color: #fff;
  background: rgba(255,255,255,0.15);
}
.navbar-user {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.85rem;
}
.navbar-user span {
  opacity: 0.9;
}
.btn-sm {
  padding: 0.25rem 0.75rem;
  font-size: 0.8rem;
  background: rgba(255,255,255,0.2);
  color: #fff;
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: 4px;
  cursor: pointer;
}
.btn-sm:hover {
  background: rgba(255,255,255,0.3);
}
</style>
