import { useState, useEffect } from 'react'
import reporteService from '@/services/reporte.service'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default function ProductosNoVendidosPage() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { reporteService.productosNoVendidos().then(r => { setData(r.data); setLoading(false) }).catch(() => setLoading(false)) }, [])

  if (loading) return <div className="py-16 text-center text-muted-foreground">Cargando...</div>

  return (
    <div>
      <div className="flex items-center gap-3 mb-6"><h1 className="text-2xl font-bold">Productos No Vendidos</h1><Badge variant="secondary" className="text-xs">{data.length} productos</Badge></div>
      <p className="text-sm text-muted-foreground mb-4">Productos que no han tenido ninguna venta (consulta con subquery NOT IN).</p>
      <div className="rounded-lg border bg-card shadow-sm">
        <Table>
          <TableHeader><TableRow><TableHead className="w-16">ID</TableHead><TableHead>Titulo</TableHead><TableHead>Tipo</TableHead><TableHead>Categoria</TableHead><TableHead className="text-right">Precio</TableHead><TableHead className="text-right">Stock</TableHead></TableRow></TableHeader>
          <TableBody>{data.map(p => (
            <TableRow key={p.id_producto}><TableCell className="font-mono text-xs text-muted-foreground">{p.id_producto}</TableCell><TableCell className="font-medium">{p.titulo}</TableCell><TableCell><Badge variant="secondary">{p.tipo}</Badge></TableCell><TableCell className="text-muted-foreground">{p.categoria}</TableCell><TableCell className="text-right font-mono">Q{Number(p.precio).toFixed(2)}</TableCell><TableCell className="text-right"><Badge variant={Number(p.stock) <= 5 ? 'destructive' : 'outline'}>{p.stock}</Badge></TableCell></TableRow>
          ))}</TableBody>
        </Table>
      </div>
    </div>
  )
}
