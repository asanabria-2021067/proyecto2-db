import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import compraService from '@/services/compra.service'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default function ComprasPage() {
  const [compras, setCompras] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const navigate = useNavigate()
  const perPage = 10
  const totalPages = useMemo(() => Math.max(1, Math.ceil(compras.length / perPage)), [compras])
  const paginated = useMemo(() => compras.slice((page - 1) * perPage, page * perPage), [compras, page])

  useEffect(() => { compraService.getAll().then(r => setCompras(r.data)).catch(() => {}) }, [])

  return (
    <div>
      <div className="flex items-center justify-between mb-6"><div className="flex items-center gap-3"><h1 className="text-2xl font-bold">Compras a Proveedores</h1><Badge variant="secondary" className="text-xs">{compras.length} total</Badge></div></div>
      <div className="rounded-lg border bg-card shadow-sm">
        <Table>
          <TableHeader><TableRow><TableHead className="w-16">ID</TableHead><TableHead>Fecha</TableHead><TableHead>Proveedor</TableHead><TableHead className="text-right">Total</TableHead><TableHead className="text-right">Acciones</TableHead></TableRow></TableHeader>
          <TableBody>
            {paginated.map(c => (
              <TableRow key={c.id_compra} className="hover:bg-muted/50">
                <TableCell className="font-mono text-xs text-muted-foreground">{c.id_compra}</TableCell>
                <TableCell>{new Date(c.fecha).toLocaleDateString('es-GT')}</TableCell>
                <TableCell>{c.proveedor ?? '-'}</TableCell>
                <TableCell className="text-right font-mono font-medium">Q{Number(c.total).toFixed(2)}</TableCell>
                <TableCell className="text-right"><Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => navigate(`/compras/${c.id_compra}`)}>Ver detalle</Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="mt-4 flex items-center justify-between"><p className="text-sm text-muted-foreground">Pagina {page} de {totalPages}</p><div className="flex gap-2"><Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Anterior</Button><Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Siguiente</Button></div></div>
    </div>
  )
}
