import { useState, useEffect } from 'react'
import ventaService from '@/services/venta.service'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default function MisComprasPage() {
  const [compras, setCompras] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { ventaService.getMisCompras().then(r => { setCompras(r.data); setLoading(false) }).catch(() => setLoading(false)) }, [])

  if (loading) return <div className="py-16 text-center text-muted-foreground">Cargando...</div>

  return (
    <div>
      <div className="flex items-center gap-3 mb-6"><h1 className="text-2xl font-bold">Mis Compras</h1><Badge variant="secondary" className="text-xs">{compras.length} compras</Badge></div>
      {compras.length === 0 ? <p className="text-center py-16 text-muted-foreground">No tienes compras aun.</p> : (
        <div className="rounded-lg border bg-card shadow-sm">
          <Table>
            <TableHeader><TableRow><TableHead className="w-16">ID</TableHead><TableHead>Fecha</TableHead><TableHead>Productos</TableHead><TableHead className="text-right">Total</TableHead></TableRow></TableHeader>
            <TableBody>{compras.map(c => (
              <TableRow key={c.id_venta} className="hover:bg-muted/50">
                <TableCell className="font-mono text-xs text-muted-foreground">{c.id_venta}</TableCell>
                <TableCell>{new Date(c.fecha).toLocaleDateString('es-GT')}</TableCell>
                <TableCell className="text-muted-foreground">{c.productos ?? '-'}</TableCell>
                <TableCell className="text-right font-mono font-medium">Q{Number(c.total).toFixed(2)}</TableCell>
              </TableRow>
            ))}</TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
