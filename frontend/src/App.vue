<script setup lang="ts">
import Navbar from './components/Navbar.vue'
import { Toaster } from '@/components/ui/sonner'
import { useAuthStore } from './stores/auth.store'
import { useRoute } from 'vue-router'

const auth = useAuthStore()
const route = useRoute()

const isLanding = () => route.path === '/'
const isFullPage = () => route.path === '/login' || route.path === '/register'
const showNavbar = () => auth.isLoggedIn && !isLanding() && !isFullPage()
</script>

<template>
  <Toaster position="top-right" :duration="3000" />
  <Navbar v-if="showNavbar()" />
  <main :class="isLanding() || isFullPage() ? '' : 'mx-auto max-w-7xl px-4 py-6 sm:px-6'">
    <RouterView />
  </main>
</template>
