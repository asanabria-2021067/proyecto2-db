<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useAuthStore } from '../stores/auth.store'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useConfirm } from '@/composables/useSwal'
import gsap from 'gsap'

const auth = useAuthStore()
const router = useRouter()
const navRef = ref<HTMLElement>()

async function logout() {
  const result = await useConfirm({
    title: 'Cerrar sesion?',
    text: 'Se cerrara tu sesion actual.',
    icon: 'question',
    confirmText: 'Si, salir',
  })
  if (!result.isConfirmed) return
  auth.logout()
  router.push('/')
}

const adminLinks = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/productos', label: 'Productos' },
  { to: '/clientes', label: 'Clientes' },
  { to: '/ventas', label: 'Ventas' },
  { to: '/catalogo', label: 'Catalogo' },
]

const clienteLinks = [
  { to: '/catalogo', label: 'Catalogo' },
  { to: '/mis-compras', label: 'Mis Compras' },
]

const visibleLinks = computed(() => {
  if (auth.rol === 'cliente') return clienteLinks
  if (auth.rol === 'admin' || auth.rol === 'vendedor') return adminLinks
  return []
})

const brandTarget = computed(() => {
  if (auth.rol === 'admin' || auth.rol === 'vendedor') return '/dashboard'
  return '/catalogo'
})

onMounted(() => {
  gsap.from(navRef.value!, {
    y: -20,
    duration: 0.3,
    ease: 'power2.out',
  })
})
</script>

<template>
  <nav ref="navRef" class="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
    <div class="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 sm:px-6">
      <!-- Brand -->
      <RouterLink :to="brandTarget" class="group flex items-center gap-2 text-lg font-bold text-foreground transition-colors duration-200 hover:text-primary">
        <span>Tienda de Libros</span>
      </RouterLink>

      <Separator orientation="vertical" class="h-6" />

      <!-- Nav links -->
      <div class="flex items-center gap-0.5 flex-1">
        <RouterLink
          v-for="link in visibleLinks"
          :key="link.to"
          :to="link.to"
          class="group relative px-3 py-1.5 text-sm font-medium text-muted-foreground rounded-md transition-all duration-200 hover:text-foreground hover:bg-accent/80 hover:shadow-sm"
          active-class="!text-primary !bg-primary/10 !shadow-sm"
        >
          {{ link.label }}
        </RouterLink>
      </div>

      <!-- User dropdown -->
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button variant="ghost" class="relative h-9 w-9 rounded-full transition-all duration-200 hover:ring-2 hover:ring-primary/20 hover:scale-105">
            <Avatar class="h-9 w-9">
              <AvatarFallback class="bg-primary text-primary-foreground text-sm font-bold">
                {{ auth.user?.username?.charAt(0).toUpperCase() }}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" class="w-52">
          <DropdownMenuLabel>
            <div class="flex flex-col gap-0.5">
              <span class="text-sm font-semibold">{{ auth.user?.username }}</span>
              <span class="text-xs text-muted-foreground capitalize">Rol: {{ auth.rol }}</span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            @click="logout"
            class="text-destructive cursor-pointer transition-colors duration-150 focus:text-destructive focus:bg-destructive/10"
          >
            Cerrar sesion
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </nav>
</template>
