import { useState, useEffect, useMemo } from 'react'
import productoService from '@/services/producto.service'
import ProductoForm from '@/components/ProductoForm'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { showConfirm, showSuccess, showError } from '@/hooks/useSwal'

export default function ProductosPage() {
  const [productos, setProductos] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [page, setPage] = useState(1)
  const perPage = 10

  const totalPages = useMemo(() => Math.max(1, Math.ceil(productos.length / perPage)), [productos])
  const paginated = useMemo(() => productos.slice((page - 1) * perPage, page * perPage), [productos, page])

  async function load() {
    try { const res = await productoService.getAll(); setProductos(res.data) } catch { showError('Error', 'No se pudieron cargar los productos') }
  }

  async function save(data: any) {
    try {
      if (editing?.id_producto) { await productoService.update(editing.id_producto, data); await showSuccess('Actualizado', 'Producto actualizado') }
      else { await productoService.create(data); await showSuccess('Creado', 'Producto creado') }
      setShowForm(false); await load()
    } catch (err: any) { showError('Error', err.response?.data?.error ?? 'Error al guardar') }
  }

  async function remove(id: number) {
    const r = await showConfirm({ title: 'Eliminar producto?', text: 'Esta accion no se puede deshacer.', confirmText: 'Si, eliminar' })
    if (!r.isConfirmed) return
    try { await productoService.remove(id); await showSuccess('Eliminado', 'Producto eliminado'); await load() }
    catch (err: any) { showError('Error', err.response?.data?.error ?? 'Error al eliminar') }
  }

  useEffect(() => { load() }, [])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3"><h1 className="text-2xl font-bold">Productos</h1><Badge variant="secondary" className="text-xs">{productos.length} total</Badge></div>
        <Button className="gap-1.5 transition-all duration-200 hover:scale-105" onClick={() => { setEditing(null); setShowForm(true) }}>+ Nuevo Producto</Button>
      </div>
      <div className="rounded-lg border bg-card shadow-sm">
        <Table>
          <TableHeader><TableRow className="hover:bg-transparent"><TableHead className="w-16">ID</TableHead><TableHead>Titulo</TableHead><TableHead>Categoria</TableHead><TableHead>Editorial</TableHead><TableHead>Autores</TableHead><TableHead className="text-right">Precio</TableHead><TableHead className="text-right">Stock</TableHead><TableHead className="text-right">Acciones</TableHead></TableRow></TableHeader>
          <TableBody>
            {paginated.map(p => (
              <TableRow key={p.id_producto} className="transition-colors duration-150 hover:bg-muted/50">
                <TableCell className="font-mono text-muted-foreground text-xs">{p.id_producto}</TableCell>
                <TableCell className="font-medium">{p.titulo}</TableCell>
                <TableCell><Badge variant="secondary" className="mr-1">{p.tipo}</Badge><span className="text-sm text-muted-foreground">{p.categoria}</span></TableCell>
                <TableCell className="text-muted-foreground">{p.editorial}</TableCell>
                <TableCell className="text-sm text-muted-foreground max-w-32 truncate">{p.autores ?? '-'}</TableCell>
                <TableCell className="text-right font-mono font-medium">Q{Number(p.precio).toFixed(2)}</TableCell>
                <TableCell className="text-right"><Badge variant={p.stock <= 5 ? 'destructive' : 'outline'}>{p.stock}</Badge></TableCell>
                <TableCell className="text-right"><div className="flex items-center justify-end gap-1">
                  <Button variant="outline" size="sm" className="h-7 px-2.5 text-xs hover:text-primary" onClick={() => { setEditing({ ...p }); setShowForm(true) }}>Editar</Button>
                  <Button variant="outline" size="sm" className="h-7 px-2.5 text-xs text-destructive border-destructive/30 hover:bg-destructive hover:text-white" onClick={() => remove(p.id_producto)}>Eliminar</Button>
                </div></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Pagina {page} de {totalPages}</p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Anterior</Button>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Siguiente</Button>
        </div>
      </div>
      {showForm && <ProductoForm producto={editing} onSave={save} onCancel={() => setShowForm(false)} />}
    </div>
  )
}
