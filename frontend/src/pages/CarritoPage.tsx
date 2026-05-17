import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import ventaService from '@/services/venta.service'
import { useConfirm, useSuccess, useError } from '@/hooks/useSwal'
import { Minus, Plus, Trash2 } from 'lucide-react'

export default function CarritoPage() {
  const cart = useCart()
  const auth = useAuth()
  const navigate = useNavigate()

  const handleComprar = useCallback(async () => {
    if (cart.items.length === 0) return
    const r = await useConfirm({ title: 'Confirmar compra?', text: `Total: Q${cart.subtotal.toFixed(2)} (${cart.count} items)`, confirmText: 'Si, comprar', icon: 'question' })
    if (!r.isConfirmed) return
    try {
      const detalles = cart.items.map(it => ({ id_producto: it.producto_id, cantidad: it.cantidad, precio_unitario: it.precio }))
      await ventaService.create({ detalles })
      cart.clear()
      await useSuccess('Compra realizada', 'Tu pedido ha sido registrado')
      navigate('/mis-compras')
    } catch (err: any) { await useError('Error', err.response?.data?.error ?? 'Error al realizar compra') }
  }, [cart, navigate])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Carrito</h1>
          <Badge variant="secondary" className="text-xs">{cart.count} items</Badge>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate('/catalogo')}>Seguir comprando</Button>
      </div>
      {cart.items.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-4">Tu carrito esta vacio</p>
          <Button onClick={() => navigate('/catalogo')}>Ir al catalogo</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {cart.items.map(item => (
            <div key={item.producto_id} className="flex items-center gap-4 rounded-lg border bg-card p-4 shadow-sm">
              <div className="h-20 w-14 rounded-md overflow-hidden bg-muted flex-shrink-0">
                {item.imagen_url ? <img src={item.imagen_url} alt={item.titulo} className="h-full w-full object-cover" /> : <div className="h-full w-full bg-gradient-to-br from-primary/20 to-muted" />}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm truncate">{item.titulo}</h3>
                <p className="text-sm text-primary font-bold">Q{item.precio.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">{item.stock} disponibles</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => cart.updateQty(item.producto_id, item.cantidad - 1)} disabled={item.cantidad <= 1}><Minus className="h-3 w-3" /></Button>
                <span className="w-8 text-center text-sm font-medium">{item.cantidad}</span>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => cart.updateQty(item.producto_id, item.cantidad + 1)} disabled={item.cantidad >= item.stock}><Plus className="h-3 w-3" /></Button>
              </div>
              <p className="text-sm font-bold w-24 text-right">Q{(item.precio * item.cantidad).toFixed(2)}</p>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => cart.removeItem(item.producto_id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-bold">Total</span>
              <span className="text-2xl font-black text-primary">Q{cart.subtotal.toFixed(2)}</span>
            </div>
            {auth.isLoggedIn && auth.rol === 'cliente' ? (
              <Button className="w-full h-11 text-base font-bold" onClick={handleComprar}>Realizar compra</Button>
            ) : (
              <Button className="w-full" onClick={() => navigate('/login')}>Inicia sesion para comprar</Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
