import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

type CartItem = {
  producto_id: number
  titulo: string
  precio: number
  imagen_url?: string | null
  stock: number
  cantidad: number
}

const STORAGE_KEY = 'cart_items'

function loadSavedItems(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .map((item: any) => ({
        producto_id: Number(item.producto_id),
        titulo: String(item.titulo ?? ''),
        precio: Number(item.precio ?? 0),
        imagen_url: item.imagen_url ?? null,
        stock: Number(item.stock ?? 0),
        cantidad: Number(item.cantidad ?? 1),
      }))
      .filter((item: CartItem) => item.producto_id > 0 && item.titulo && item.cantidad > 0)
  } catch {
    return []
  }
}

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>(loadSavedItems())

  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.value))
  }

  const count = computed(() => items.value.reduce((acc, item) => acc + item.cantidad, 0))
  const subtotal = computed(() => items.value.reduce((acc, item) => acc + item.precio * item.cantidad, 0))

  function addItem(producto: any, cantidad = 1) {
    const productId = Number(producto.id_producto)
    if (!productId || cantidad <= 0) return

    const found = items.value.find((it) => it.producto_id === productId)
    if (found) {
      found.cantidad = Math.min(found.stock, found.cantidad + cantidad)
    } else {
      items.value.push({
        producto_id: productId,
        titulo: String(producto.titulo),
        precio: Number(producto.precio),
        imagen_url: producto.imagen_url ?? null,
        stock: Number(producto.stock ?? 0),
        cantidad: Math.min(Number(producto.stock ?? 0), cantidad),
      })
    }
    items.value = items.value.filter((item) => item.cantidad > 0 && item.stock > 0)
    persist()
  }

  function updateQty(productoId: number, cantidad: number) {
    const found = items.value.find((it) => it.producto_id === productoId)
    if (!found) return
    found.cantidad = Math.max(1, Math.min(found.stock, cantidad))
    persist()
  }

  function removeItem(productoId: number) {
    items.value = items.value.filter((it) => it.producto_id !== productoId)
    persist()
  }

  function clear() {
    items.value = []
    persist()
  }

  function syncStock(productos: any[]) {
    const byId = new Map<number, any>()
    for (const p of productos) {
      byId.set(Number(p.id_producto), p)
    }
    items.value = items.value
      .map((item) => {
        const source = byId.get(item.producto_id)
        if (!source) return item
        const nextStock = Number(source.stock ?? 0)
        return {
          ...item,
          titulo: String(source.titulo ?? item.titulo),
          precio: Number(source.precio ?? item.precio),
          imagen_url: source.imagen_url ?? item.imagen_url,
          stock: nextStock,
          cantidad: Math.min(item.cantidad, Math.max(nextStock, 0)),
        }
      })
      .filter((item) => item.stock > 0 && item.cantidad > 0)
    persist()
  }

  return { items, count, subtotal, addItem, updateQty, removeItem, clear, syncStock }
})
