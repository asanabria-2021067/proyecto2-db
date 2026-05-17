import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import compraService from '@/services/compra.service'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default function CompraDetallePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [detalle, setDetalle] = useState<any[]>([])

  useEffect(() => { if (id) compraService.getDetalle(Number(id)).then(r => setDetalle(r.data)).catch(() => {}) }, [id])

  return (
    <div>
      <Button variant="outline" size="sm" className="mb-4" onClick={() => navigate('/compras')}>← Volver a compras</Button>
      <h1 className="text-2xl font-bold mb-6">Compra #{id}</h1>
      <div className="rounded-lg border bg-card shadow-sm">
        <Table>
          <TableHeader><TableRow><TableHead>Producto</TableHead><TableHead className="text-right">Cantidad</TableHead><TableHead className="text-right">Costo Unit.</TableHead><TableHead className="text-right">Subtotal</TableHead></TableRow></TableHeader>
          <TableBody>{detalle.map((d, i) => (
            <TableRow key={i}><TableCell className="font-medium">{d.titulo ?? d.producto}</TableCell><TableCell className="text-right">{d.cantidad}</TableCell><TableCell className="text-right font-mono">Q{Number(d.costo_unitario ?? d.precio_unitario).toFixed(2)}</TableCell><TableCell className="text-right font-mono font-medium">Q{(Number(d.costo_unitario ?? d.precio_unitario) * Number(d.cantidad)).toFixed(2)}</TableCell></TableRow>
          ))}</TableBody>
        </Table>
      </div>
    </div>
  )
}
