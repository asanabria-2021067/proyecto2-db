<script setup lang="ts">
import Navbar from './components/Navbar.vue'
import { useAuthStore } from './stores/auth.store'

const auth = useAuthStore()
</script>

<template>
  <Navbar v-if="auth.isLoggedIn" />
  <main class="container">
    <RouterView />
  </main>
</template>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem;
}
</style>
