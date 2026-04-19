<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-vue-next'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const mobileOpen = ref(false)

const ctaLabel = computed(() => (auth.isLoggedIn ? 'Mi panel' : 'Iniciar sesion'))

const links = computed(() => [
  { to: '/', label: 'Inicio' },
  { to: '/catalogo', label: 'Catalogo' },
])

watch(
  () => route.path,
  () => {
    mobileOpen.value = false
  },
)

</script>

<template>
  <header
    class="sticky top-0 z-50 border-b border-white/40 bg-background/85 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70"
  >
    <div class="public-nav-shell mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
      <RouterLink to="/" class="flex items-center gap-2 text-base font-bold tracking-tight text-foreground sm:text-lg">
        <span>Tienda de Libros y mangas</span>
      </RouterLink>

      <div class="hidden flex-1 items-center gap-1 pl-2 md:flex">
        <RouterLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="inline-flex h-9 transform-none items-center rounded-md px-3 text-sm font-semibold leading-none text-muted-foreground transition-all duration-200 hover:bg-primary/10 hover:text-primary active:scale-[0.98]"
          active-class="!bg-primary/15 !text-primary shadow-sm"
        >
          {{ link.label }}
        </RouterLink>
      </div>

      <div class="ml-auto hidden items-center gap-2 md:flex">
        <Button
          v-if="!auth.isLoggedIn"
          variant="outline"
          class="inline-flex h-9 items-center px-4 text-sm leading-none transition-all duration-200 hover:border-primary/40 hover:bg-primary/5 hover:text-primary active:scale-[0.98]"
          @click="router.push('/register')"
        >
          Registrarse
        </Button>
        <Button
          class="inline-flex h-9 items-center px-4 text-sm leading-none transition-all duration-200 hover:shadow-md active:scale-[0.98]"
          @click="auth.isLoggedIn ? router.push(auth.rol === 'cliente' ? '/catalogo' : '/dashboard') : router.push('/login')"
        >
          {{ ctaLabel }}
        </Button>
      </div>

      <Button variant="ghost" size="icon" class="ml-auto h-9 w-9 md:hidden" @click="mobileOpen = !mobileOpen">
        <Menu class="h-5 w-5" />
      </Button>
    </div>

    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div v-if="mobileOpen" class="space-y-1 border-t border-border/70 bg-background/95 px-4 pb-4 pt-2 md:hidden">
        <RouterLink
          v-for="link in links"
          :key="`mobile-${link.to}`"
          :to="link.to"
          class="block rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/70 hover:text-foreground"
          active-class="!bg-primary/10 !text-primary"
        >
          {{ link.label }}
        </RouterLink>
        <Button
          v-if="!auth.isLoggedIn"
          variant="outline"
          class="h-9 w-full text-sm leading-none transition-all duration-200 hover:border-primary/40 hover:bg-primary/5 hover:text-primary active:scale-[0.98]"
          @click="router.push('/register')"
        >
          Registrarse
        </Button>
        <Button
          class="h-9 w-full text-sm leading-none transition-all duration-200 hover:shadow-md active:scale-[0.98]"
          @click="auth.isLoggedIn ? router.push(auth.rol === 'cliente' ? '/catalogo' : '/dashboard') : router.push('/login')"
        >
          {{ ctaLabel }}
        </Button>
      </div>
    </Transition>
  </header>
</template>
