<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useAuthStore } from '../stores/auth.store'
import { useCartStore } from '../stores/cart.store'
import { useRoute, useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Menu, ShoppingCart } from 'lucide-vue-next'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useConfirm } from '@/composables/useSwal'

const auth = useAuthStore()
const cart = useCartStore()
const router = useRouter()
const route = useRoute()
const mobileOpen = ref(false)

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
  { to: '/compras', label: 'Compras' },
  { to: '/reportes/productos-no-vendidos', label: 'No Vendidos' },
  { to: '/reportes/clientes-sobre-promedio', label: 'Top Clientes' },
  { to: '/catalogo', label: 'Catalogo' },
]

const clienteLinks = [
  { to: '/catalogo', label: 'Catalogo' },
  { to: '/carrito', label: 'Carrito' },
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

watch(
  () => route.path,
  () => {
    mobileOpen.value = false
  },
)
</script>

<template>
  <nav
    class="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-xl"
  >
    <div class="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
      <RouterLink
        :to="brandTarget"
        class="group flex items-center gap-2 text-base font-bold tracking-tight text-foreground transition-colors duration-200 hover:text-primary sm:text-lg"
      >
        <span>Tienda de Libros y mangas</span>
      </RouterLink>

      <Separator orientation="vertical" class="hidden h-7 md:block" />

      <div class="hidden flex-1 items-center gap-1 md:flex">
        <RouterLink
          v-for="link in visibleLinks"
          :key="link.to"
          :to="link.to"
          class="inline-flex h-9 transform-none items-center rounded-md px-3 text-sm font-semibold leading-none text-muted-foreground transition-all duration-200 hover:bg-primary/10 hover:text-primary active:scale-[0.98]"
          active-class="!bg-primary/10 !text-primary shadow-sm"
        >
          {{ link.label }}
        </RouterLink>
      </div>

      <Button
        v-if="auth.rol === 'cliente'"
        variant="ghost"
        size="icon"
        class="relative hidden h-9 w-9 rounded-full md:inline-flex"
        @click="router.push('/carrito')"
      >
        <ShoppingCart class="h-4 w-4" />
        <Badge
          v-if="cart.count > 0"
          variant="secondary"
          class="absolute -right-1 -top-1 h-5 min-w-5 rounded-full px-1 text-[10px]"
        >
          {{ cart.count }}
        </Badge>
      </Button>

      <Button
        variant="ghost"
        size="icon"
        class="ml-auto h-9 w-9 md:hidden"
        @click="mobileOpen = !mobileOpen"
      >
        <Menu class="h-5 w-5" />
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button
            variant="ghost"
            class="relative hidden h-9 w-9 rounded-full transition-all duration-200 hover:scale-105 hover:ring-2 hover:ring-primary/20 md:inline-flex"
          >
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

    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div v-if="mobileOpen" class="border-t border-border/70 bg-background/95 px-4 pb-4 pt-2 md:hidden">
        <div class="space-y-1">
          <RouterLink
            v-for="link in visibleLinks"
            :key="`mobile-${link.to}`"
            :to="link.to"
            class="block rounded-md px-3 py-2 text-sm font-semibold leading-none text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
            active-class="!bg-primary/10 !text-primary"
          >
            {{ link.label }}
          </RouterLink>
          <button
            type="button"
            class="mt-1 w-full rounded-md border border-destructive/30 px-3 py-2 text-left text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
            @click="logout"
          >
            Cerrar sesion
          </button>
        </div>
      </div>
    </Transition>
  </nav>
</template>
