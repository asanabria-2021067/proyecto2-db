import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '@/services/api'
import compraService from '@/services/compra.service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useConfirm, useSuccess, useError } from '@/hooks/useSwal'
import { Trash2, Plus, Minus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface CompraItem {
  producto_id: number
  titulo: string
  cantidad: number
  precio_unitario: number
}

export default function NuevaCompraPage() {
  const navigate = useNavigate()
  const [proveedores, setProveedores] = useState<any[]>([])
  const [productos, setProductos] = useState<any[]>([])
  const [proveedorId, setProveedorId] = useState('')
  const [items, setItems] = useState<CompraItem[]>([])
  const [selectedProducto, setSelectedProducto] = useState('')
  const [cantidad, setCantidad] = useState(1)
  const [precioUnit, setPrecioUnit] = useState('')
  const [loading, setLoading] = useState(false)

  const total = useMemo(() => items.reduce((sum, it) => sum + it.cantidad * it.precio_unitario, 0), [items])

  useEffect(() => {
    api.get('/proveedores').then(r => setProveedores(r.data)).catch(() => {})
    api.get('/productos').then(r => setProductos(r.data)).catch(() => {})
  }, [])

  const addItem = useCallback(() => {
    if (!selectedProducto || cantidad <= 0 || !precioUnit || Number(precioUnit) <= 0) {
      useError('Error', 'Selecciona un producto, cantidad y precio validos')
      return
    }
    const prod = productos.find(p => String(p.id_producto) === selectedProducto)
    if (!prod) return
    setItems(prev => {
      const existing = prev.find(it => it.producto_id === prod.id_producto)
      if (existing) {
        return prev.map(it => it.producto_id === prod.id_producto ? { ...it, cantidad: it.cantidad + cantidad, precio_unitario: Number(precioUnit) } : it)
      }
      return [...prev, { producto_id: prod.id_producto, titulo: prod.titulo, cantidad, precio_unitario: Number(precioUnit) }]
    })
    setSelectedProducto('')
    setCantidad(1)
    setPrecioUnit('')
  }, [selectedProducto, cantidad, precioUnit, productos])

  const removeItem = useCallback((pid: number) => {
    setItems(prev => prev.filter(it => it.producto_id !== pid))
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!proveedorId) { useError('Error', 'Selecciona un proveedor'); return }
    if (items.length === 0) { useError('Error', 'Agrega al menos un producto'); return }
    const r = await useConfirm({ title: 'Confirmar compra?', text: `Total: Q${total.toFixed(2)} (${items.length} productos)`, confirmText: 'Si, registrar', icon: 'question' })
    if (!r.isConfirmed) return
    setLoading(true)
    try {
      await compraService.create({ proveedor_id: Number(proveedorId), items: items.map(it => ({ producto_id: it.producto_id, cantidad: it.cantidad, precio_unitario: it.precio_unitario })) })
      await useSuccess('Compra registrada', 'El stock se ha actualizado')
      navigate('/compras')
    } catch (err: any) {
      useError('Error', err.response?.data?.error ?? 'Error al registrar compra')
    } finally { setLoading(false) }
  }, [proveedorId, items, total, navigate])

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Nueva Compra a Proveedor</h1>
        <Button variant="outline" size="sm" onClick={() => navigate('/compras')}>← Volver</Button>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Proveedor</CardTitle></CardHeader>
          <CardContent>
            <Select value={proveedorId} onValueChange={setProveedorId}>
              <SelectTrigger><SelectValue placeholder="Seleccionar proveedor" /></SelectTrigger>
              <SelectContent>
                {proveedores.map(p => <SelectItem key={p.id_proveedor} value={String(p.id_proveedor)}>{p.nombre}</SelectItem>)}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Agregar Producto</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <Label className="text-xs">Producto</Label>
                <Select value={selectedProducto} onValueChange={setSelectedProducto}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>
                    {productos.map(p => <SelectItem key={p.id_producto} value={String(p.id_producto)}>{p.titulo}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Cantidad</Label>
                <Input type="number" min={1} value={cantidad} onChange={e => setCantidad(Number(e.target.value))} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Costo unit.</Label>
                <Input type="number" step="0.01" min={0} value={precioUnit} onChange={e => setPrecioUnit(e.target.value)} placeholder="Q" />
              </div>
            </div>
            <Button variant="secondary" size="sm" className="mt-3 gap-1" onClick={addItem}>
              <Plus className="h-3 w-3" /> Agregar al pedido
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Detalle del Pedido</CardTitle>
              <Badge variant="secondary">{items.length} items</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Aun no has agregado productos.</p>
            ) : (
              <div className="space-y-2">
                <AnimatePresence>
                  {items.map(it => (
                    <motion.div
                      key={it.producto_id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center gap-3 rounded-lg bg-muted/50 p-3"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{it.titulo}</p>
                        <p className="text-xs text-muted-foreground">Q{it.precio_unitario.toFixed(2)} c/u</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setItems(prev => prev.map(i => i.producto_id === it.producto_id ? { ...i, cantidad: Math.max(1, i.cantidad - 1) } : i))}><Minus className="h-3 w-3" /></Button>
                        <span className="w-8 text-center text-sm font-medium">{it.cantidad}</span>
                        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setItems(prev => prev.map(i => i.producto_id === it.producto_id ? { ...i, cantidad: i.cantidad + 1 } : i))}><Plus className="h-3 w-3" /></Button>
                      </div>
                      <p className="text-sm font-bold w-20 text-right">Q{(it.cantidad * it.precio_unitario).toFixed(2)}</p>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeItem(it.producto_id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </motion.div>
                  ))}
                </AnimatePresence>

                <div className="flex items-center justify-between pt-3 border-t mt-3">
                  <span className="text-lg font-bold">Total</span>
                  <span className="text-2xl font-black text-primary">Q{total.toFixed(2)}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Button className="w-full h-11 text-base font-bold" disabled={loading || items.length === 0 || !proveedorId} onClick={handleSubmit}>
          {loading ? 'Registrando...' : 'Registrar Compra a Proveedor'}
        </Button>
      </div>
    </div>
  )
}
