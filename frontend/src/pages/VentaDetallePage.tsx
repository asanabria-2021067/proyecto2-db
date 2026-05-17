import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ventaService from '@/services/venta.service'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default function VentaDetallePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [detalle, setDetalle] = useState<any>(null)

  useEffect(() => {
    if (id) ventaService.getDetalle(Number(id)).then(r => setDetalle(r.data)).catch(() => {})
  }, [id])

  if (!detalle) return <div className="py-16 text-center text-muted-foreground">Cargando...</div>

  return (
    <div>
      <Button variant="outline" size="sm" className="mb-4" onClick={() => navigate('/ventas')}>← Volver a ventas</Button>
      <div className="flex items-center gap-3 mb-6"><h1 className="text-2xl font-bold">Venta #{id}</h1><Badge variant="secondary">{new Date(detalle.fecha ?? detalle[0]?.fecha).toLocaleDateString('es-GT')}</Badge></div>
      <div className="rounded-lg border bg-card shadow-sm">
        <Table>
          <TableHeader><TableRow><TableHead>Producto</TableHead><TableHead className="text-right">Cantidad</TableHead><TableHead className="text-right">Precio Unit.</TableHead><TableHead className="text-right">Subtotal</TableHead></TableRow></TableHeader>
          <TableBody>
            {(Array.isArray(detalle) ? detalle : detalle.items ?? []).map((d: any, i: number) => (
              <TableRow key={i}>
                <TableCell className="font-medium">{d.titulo ?? d.producto}</TableCell>
                <TableCell className="text-right">{d.cantidad}</TableCell>
                <TableCell className="text-right font-mono">Q{Number(d.precio_unitario).toFixed(2)}</TableCell>
                <TableCell className="text-right font-mono font-medium">Q{(Number(d.precio_unitario) * Number(d.cantidad)).toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
