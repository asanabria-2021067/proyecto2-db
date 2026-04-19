<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ShoppingBag, Trash2 } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import api from '@/services/api'
import { useAuthStore } from '@/stores/auth.store'
import { useCartStore } from '@/stores/cart.store'
import { useConfirm, useError, useSuccess } from '@/composables/useSwal'
import gsap from 'gsap'

const router = useRouter()
const auth = useAuthStore()
const cart = useCartStore()
const paying = ref(false)

const iva = computed(() => cart.subtotal * 0.12)
const total = computed(() => cart.subtotal + iva.value)

function onQtyInput(productoId: number, value: string) {
  const num = Number(value)
  if (!Number.isFinite(num)) return
  cart.updateQty(productoId, num)
}

async function checkout() {
  if (!cart.items.length) return
  if (!auth.isLoggedIn) {
    useError('Inicia sesion', 'Debes iniciar sesion para confirmar la compra')
    router.push('/login')
    return
  }
  if (auth.rol !== 'cliente') {
    useError('Acceso denegado', 'Solo clientes pueden comprar desde el carrito')
    return
  }

  const result = await useConfirm({
    title: 'Confirmar compra',
    text: `Se procesara un total de Q${total.value.toFixed(2)} con ${cart.count} articulo(s).`,
    icon: 'question',
    confirmText: 'Confirmar',
  })
  if (!result.isConfirmed) return

  paying.value = true
  try {
    await api.post('/ventas', {
      items: cart.items.map((item) => ({
        producto_id: item.producto_id,
        cantidad: item.cantidad,
        precio_unitario: item.precio,
      })),
    })
    cart.clear()
    await useSuccess('Compra realizada', 'Tu pedido fue registrado exitosamente')
    router.push('/mis-compras')
  } catch (err: any) {
    useError('Error', err.response?.data?.error ?? 'No se pudo procesar la compra')
  } finally {
    paying.value = false
  }
}

async function clearCart() {
  if (!cart.items.length) return
  const result = await useConfirm({
    title: 'Vaciar carrito?',
    text: 'Se eliminaran todos los productos del carrito.',
    icon: 'warning',
    confirmText: 'Vaciar',
  })
  if (!result.isConfirmed) return
  cart.clear()
}

onMounted(() => {
  gsap.from('.cart-anim', {
    y: 22,
    opacity: 0,
    duration: 0.3,
    stagger: 0.05,
    ease: 'power2.out',
  })
})
</script>

<template>
  <div class="space-y-6">
    <div class="cart-anim flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <ShoppingBag class="h-5 w-5" />
        </div>
        <div>
          <h1 class="text-2xl font-bold">Carrito</h1>
          <p class="text-sm text-muted-foreground">Revisa productos antes de confirmar tu compra</p>
        </div>
      </div>
      <Badge variant="secondary" class="text-xs">{{ cart.count }} articulo(s)</Badge>
    </div>

    <div v-if="!cart.items.length" class="cart-anim rounded-2xl border bg-card p-12 text-center shadow-sm">
      <p class="text-lg font-semibold text-foreground">Tu carrito esta vacio</p>
      <p class="mt-1 text-sm text-muted-foreground">Agrega productos desde el catalogo para comprar.</p>
      <Button class="mt-5" @click="router.push('/catalogo')">Ir al catalogo</Button>
    </div>

    <template v-else>
      <Card class="cart-anim rounded-2xl shadow-sm">
        <CardHeader class="pb-2">
          <CardTitle class="text-sm uppercase tracking-wide text-muted-foreground">Productos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow class="hover:bg-transparent">
                <TableHead>Producto</TableHead>
                <TableHead class="w-28 text-center">Cantidad</TableHead>
                <TableHead class="text-right">Precio Unit.</TableHead>
                <TableHead class="text-right">Subtotal</TableHead>
                <TableHead class="w-16 text-right">Accion</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow
                v-for="item in cart.items"
                :key="item.producto_id"
                class="transition-colors duration-150 hover:bg-muted/50"
              >
                <TableCell>
                  <div class="flex items-center gap-3">
                    <img
                      v-if="item.imagen_url"
                      :src="item.imagen_url"
                      :alt="item.titulo"
                      class="h-14 w-10 rounded object-cover"
                    />
                    <div>
                      <p class="font-medium">{{ item.titulo }}</p>
                      <p class="text-xs text-muted-foreground">Stock disponible: {{ item.stock }}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell class="text-center">
                  <Input
                    type="number"
                    min="1"
                    :max="item.stock"
                    :model-value="String(item.cantidad)"
                    class="mx-auto w-20 text-center"
                    @update:model-value="(v) => onQtyInput(item.producto_id, String(v ?? '1'))"
                  />
                </TableCell>
                <TableCell class="text-right font-mono">Q{{ item.precio.toFixed(2) }}</TableCell>
                <TableCell class="text-right font-mono font-semibold">Q{{ (item.precio * item.cantidad).toFixed(2) }}</TableCell>
                <TableCell class="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    class="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    @click="cart.removeItem(item.producto_id)"
                  >
                    <Trash2 class="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card class="cart-anim rounded-2xl shadow-sm">
        <CardContent class="pt-6">
          <div class="space-y-2 text-sm">
            <div class="flex items-center justify-between">
              <span class="text-muted-foreground">Subtotal</span>
              <span class="font-mono">Q{{ cart.subtotal.toFixed(2) }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-muted-foreground">IVA (12%)</span>
              <span class="font-mono">Q{{ iva.toFixed(2) }}</span>
            </div>
            <div class="mt-2 flex items-center justify-between border-t pt-3 text-base font-bold">
              <span>Total</span>
              <span class="font-mono text-primary">Q{{ total.toFixed(2) }}</span>
            </div>
          </div>
          <div class="mt-5 flex flex-wrap justify-end gap-2">
            <Button variant="outline" @click="clearCart">Vaciar carrito</Button>
            <Button :disabled="paying" @click="checkout">
              {{ paying ? 'Procesando...' : 'Confirmar compra' }}
            </Button>
          </div>
        </CardContent>
      </Card>
    </template>
  </div>
</template>
