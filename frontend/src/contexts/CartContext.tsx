import { createContext, useContext, useReducer, useMemo, useCallback, type ReactNode } from 'react'

export interface CartItem {
  producto_id: number
  titulo: string
  precio: number
  imagen_url?: string | null
  stock: number
  cantidad: number
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: { producto: any; cantidad: number } }
  | { type: 'REMOVE_ITEM'; payload: number }
  | { type: 'UPDATE_QTY'; payload: { productoId: number; cantidad: number } }
  | { type: 'CLEAR' }
  | { type: 'SYNC_STOCK'; payload: any[] }

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

function persist(items: CartItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

function cartReducer(state: CartItem[], action: CartAction): CartItem[] {
  let newState: CartItem[]
  switch (action.type) {
    case 'ADD_ITEM': {
      const { producto, cantidad } = action.payload
      const productId = Number(producto.id_producto)
      if (!productId || cantidad <= 0) return state
      const found = state.find(it => it.producto_id === productId)
      if (found) {
        newState = state.map(it =>
          it.producto_id === productId
            ? { ...it, cantidad: Math.min(it.stock, it.cantidad + cantidad) }
            : it
        )
      } else {
        newState = [...state, {
          producto_id: productId,
          titulo: String(producto.titulo),
          precio: Number(producto.precio),
          imagen_url: producto.imagen_url ?? null,
          stock: Number(producto.stock ?? 0),
          cantidad: Math.min(Number(producto.stock ?? 0), cantidad),
        }]
      }
      newState = newState.filter(item => item.cantidad > 0 && item.stock > 0)
      persist(newState)
      return newState
    }
    case 'REMOVE_ITEM':
      newState = state.filter(it => it.producto_id !== action.payload)
      persist(newState)
      return newState
    case 'UPDATE_QTY': {
      const { productoId, cantidad } = action.payload
      newState = state.map(it =>
        it.producto_id === productoId
          ? { ...it, cantidad: Math.max(1, Math.min(it.stock, cantidad)) }
          : it
      )
      persist(newState)
      return newState
    }
    case 'CLEAR':
      persist([])
      return []
    case 'SYNC_STOCK': {
      const byId = new Map<number, any>()
      for (const p of action.payload) byId.set(Number(p.id_producto), p)
      newState = state
        .map(item => {
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
        .filter(item => item.stock > 0 && item.cantidad > 0)
      persist(newState)
      return newState
    }
    default:
      return state
  }
}

interface CartContextType {
  items: CartItem[]
  count: number
  subtotal: number
  addItem: (producto: any, cantidad?: number) => void
  removeItem: (productoId: number) => void
  updateQty: (productoId: number, cantidad: number) => void
  clear: () => void
  syncStock: (productos: any[]) => void
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, dispatch] = useReducer(cartReducer, null, loadSavedItems)

  const count = useMemo(() => items.reduce((acc, item) => acc + item.cantidad, 0), [items])
  const subtotal = useMemo(() => items.reduce((acc, item) => acc + item.precio * item.cantidad, 0), [items])

  const addItem = useCallback((producto: any, cantidad = 1) => {
    dispatch({ type: 'ADD_ITEM', payload: { producto, cantidad } })
  }, [])

  const removeItem = useCallback((productoId: number) => {
    dispatch({ type: 'REMOVE_ITEM', payload: productoId })
  }, [])

  const updateQty = useCallback((productoId: number, cantidad: number) => {
    dispatch({ type: 'UPDATE_QTY', payload: { productoId, cantidad } })
  }, [])

  const clear = useCallback(() => {
    dispatch({ type: 'CLEAR' })
  }, [])

  const syncStock = useCallback((productos: any[]) => {
    dispatch({ type: 'SYNC_STOCK', payload: productos })
  }, [])

  const value: CartContextType = { items, count, subtotal, addItem, removeItem, updateQty, clear, syncStock }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
