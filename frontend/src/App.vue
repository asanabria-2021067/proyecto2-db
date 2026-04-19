<script setup lang="ts">
import Navbar from './components/Navbar.vue'
import PublicNavbar from './components/PublicNavbar.vue'
import { Toaster } from '@/components/ui/sonner'
import { useAuthStore } from './stores/auth.store'
import { useRoute } from 'vue-router'

const auth = useAuthStore()
const route = useRoute()

const isLanding = () => route.path === '/'
const isFullPage = () => route.path === '/login' || route.path === '/register'
const showPrivateNavbar = () => auth.isLoggedIn && !isFullPage()
const showPublicNavbar = () => !auth.isLoggedIn && !isFullPage()
</script>

<template>
  <Toaster position="top-right" :duration="3000" />
  <Navbar v-if="showPrivateNavbar()" />
  <PublicNavbar v-else-if="showPublicNavbar()" />
  <main
    :class="isFullPage() || isLanding() ? '' : 'mx-auto max-w-7xl px-4 py-6 sm:px-6'"
  >
    <RouterView />
  </main>
</template>
