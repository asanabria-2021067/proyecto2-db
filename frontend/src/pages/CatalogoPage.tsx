import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '@/services/api'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useSuccess, useError } from '@/hooks/useSwal'
import { ShoppingCart } from 'lucide-react'
import gsap from 'gsap'

export default function CatalogoPage() {
  const auth = useAuth()
  const cart = useCart()
  const navigate = useNavigate()
  const [productos, setProductos] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [tipoFilter, setTipoFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [showDialog, setShowDialog] = useState(false)

  const filtered = useMemo(() => {
    let list = productos
    if (search) {
      const q = search.toLowerCase()
      list = list.filter((p: any) => p.titulo.toLowerCase().includes(q) || (p.autores ?? '').toLowerCase().includes(q))
    }
    if (tipoFilter && tipoFilter !== 'all') list = list.filter((p: any) => p.tipo === tipoFilter)
    return list
  }, [productos, search, tipoFilter])

  const tipos = useMemo(() => [...new Set(productos.map((p: any) => p.tipo))], [productos])

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value), [])

  const agregarAlCarrito = useCallback(async (producto: any) => {
    if (producto.stock <= 0) { useError('Sin stock', 'Este producto esta agotado'); return }
    cart.addItem(producto, 1)
    await useSuccess('Agregado', `"${producto.titulo}" se agrego al carrito`)
  }, [cart])

  useEffect(() => {
    api.get('/productos').then(res => {
      setProductos(res.data)
      cart.syncStock(res.data)
      setLoading(false)
      requestAnimationFrame(() => gsap.from('.catalog-item', { y: 30, duration: 0.35, stagger: 0.04, ease: 'power2.out' }))
    }).catch(() => setLoading(false))
  }, [])

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Catalogo</h1>
          <Badge variant="secondary" className="text-xs">{filtered.length} productos</Badge>
        </div>
        <div className="flex items-center gap-2">
          {auth.rol === 'cliente' && <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate('/carrito')}><ShoppingCart className="h-4 w-4" />Carrito ({cart.count})</Button>}
          {!auth.isLoggedIn && <Button variant="outline" size="sm" onClick={() => navigate('/')}>Volver al inicio</Button>}
        </div>
      </div>
      <div className="flex gap-3 mb-6">
        <Input value={search} onChange={handleSearch} placeholder="Buscar por titulo o autor..." className="flex-1" />
        <Select value={tipoFilter} onValueChange={setTipoFilter}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Todos los tipos" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            {tipos.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      {loading ? <div className="text-center py-16 text-muted-foreground">Cargando catalogo...</div> : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {filtered.map(p => (
            <div key={p.id_producto} className="catalog-item group">
              <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-md transition-all duration-300 group-hover:shadow-xl group-hover:shadow-primary/15 group-hover:-translate-y-2 cursor-pointer" onClick={() => { setSelectedProduct(p); setShowDialog(true) }}>
                {p.imagen_url ? <img src={p.imagen_url} alt={p.titulo} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" /> : <div className="h-full w-full bg-gradient-to-br from-primary/20 via-accent/10 to-muted flex items-center justify-center"><span className="text-xs text-muted-foreground font-medium px-3 text-center">{p.titulo}</span></div>}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                  {p.descripcion && <p className="text-white/80 text-xs line-clamp-3 mb-2">{p.descripcion}</p>}
                  <div className="flex items-center justify-between">
                    <span className="text-white font-bold text-lg">Q{Number(p.precio).toFixed(2)}</span>
                    {auth.isLoggedIn && auth.rol === 'cliente' && p.stock > 0 && <Button size="sm" className="h-7 text-xs" onClick={e => { e.stopPropagation(); agregarAlCarrito(p) }}>Agregar</Button>}
                  </div>
                </div>
                <Badge variant={p.stock <= 5 ? 'destructive' : 'secondary'} className="absolute top-2 right-2 text-[10px] opacity-90">{p.stock > 0 ? `${p.stock} disp.` : 'Agotado'}</Badge>
                <Badge variant="secondary" className="absolute top-2 left-2 text-[10px] bg-black/50 text-white border-0">{p.tipo}</Badge>
              </div>
              <div className="mt-2.5 px-0.5">
                <h3 className="font-semibold text-sm text-foreground leading-tight line-clamp-2 group-hover:text-primary">{p.titulo}</h3>
                {p.autores && <p className="text-xs text-muted-foreground mt-0.5 truncate">{p.autores}</p>}
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm font-bold text-primary">Q{Number(p.precio).toFixed(2)}</span>
                  <span className="text-[10px] text-muted-foreground">{p.editorial}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {!loading && filtered.length === 0 && <p className="text-center py-16 text-muted-foreground">No se encontraron productos.</p>}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedProduct && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">{selectedProduct.titulo}</DialogTitle>
                {selectedProduct.autores && <DialogDescription>por {selectedProduct.autores}</DialogDescription>}
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div className="aspect-[2/3] rounded-lg overflow-hidden shadow-lg">
                  {selectedProduct.imagen_url ? <img src={selectedProduct.imagen_url} alt={selectedProduct.titulo} className="h-full w-full object-cover" /> : <div className="h-full w-full bg-gradient-to-br from-primary/20 via-accent/10 to-muted flex items-center justify-center"><span className="text-sm text-muted-foreground">{selectedProduct.titulo}</span></div>}
                </div>
                <div className="flex flex-col gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">Detalles</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between"><span className="text-sm text-muted-foreground">Tipo:</span><Badge variant="secondary">{selectedProduct.tipo}</Badge></div>
                      <div className="flex justify-between"><span className="text-sm text-muted-foreground">Editorial:</span><span className="text-sm font-medium">{selectedProduct.editorial}</span></div>
                      <div className="flex justify-between"><span className="text-sm text-muted-foreground">Categoria:</span><span className="text-sm font-medium">{selectedProduct.categoria}</span></div>
                      {selectedProduct.anio_publicacion && <div className="flex justify-between"><span className="text-sm text-muted-foreground">Año:</span><span className="text-sm font-medium">{selectedProduct.anio_publicacion}</span></div>}
                      {selectedProduct.isbn && <div className="flex justify-between"><span className="text-sm text-muted-foreground">ISBN:</span><span className="text-sm font-mono text-xs">{selectedProduct.isbn}</span></div>}
                    </div>
                  </div>
                  {selectedProduct.descripcion && <div><h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">Descripcion</h3><p className="text-sm leading-relaxed">{selectedProduct.descripcion}</p></div>}
                  <div className="mt-auto pt-4 border-t">
                    <div className="flex items-center justify-between mb-4">
                      <div><p className="text-xs text-muted-foreground">Precio</p><p className="text-2xl font-bold text-primary">Q{Number(selectedProduct.precio).toFixed(2)}</p></div>
                      <div className="text-right"><p className="text-xs text-muted-foreground">Stock</p><Badge variant={selectedProduct.stock <= 5 ? 'destructive' : 'secondary'} className="text-sm">{selectedProduct.stock > 0 ? `${selectedProduct.stock} unidades` : 'Agotado'}</Badge></div>
                    </div>
                    {auth.isLoggedIn && auth.rol === 'cliente' && <Button className="w-full" disabled={selectedProduct.stock <= 0} onClick={() => { agregarAlCarrito(selectedProduct); setShowDialog(false) }}><ShoppingCart className="h-4 w-4 mr-2" />{selectedProduct.stock > 0 ? 'Agregar al carrito' : 'Sin stock'}</Button>}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
