import { useState, useEffect } from 'react'
import reporteService from '@/services/reporte.service'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default function ClientesSobrePromedioPage() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { reporteService.clientesSobrePromedio().then(r => { setData(r.data); setLoading(false) }).catch(() => setLoading(false)) }, [])

  if (loading) return <div className="py-16 text-center text-muted-foreground">Cargando...</div>

  return (
    <div>
      <div className="flex items-center gap-3 mb-6"><h1 className="text-2xl font-bold">Clientes Sobre el Promedio</h1><Badge variant="secondary" className="text-xs">{data.length} clientes</Badge></div>
      <p className="text-sm text-muted-foreground mb-4">Clientes cuyo gasto total esta sobre el promedio general (subquery con HAVING).</p>
      <div className="rounded-lg border bg-card shadow-sm">
        <Table>
          <TableHeader><TableRow><TableHead>Cliente</TableHead><TableHead className="text-right">Total Compras</TableHead><TableHead className="text-right">Total Gastado</TableHead></TableRow></TableHeader>
          <TableBody>{data.map((c, i) => (
            <TableRow key={i}><TableCell className="font-medium">{c.nombre ?? c.cliente}</TableCell><TableCell className="text-right">{c.total_compras ?? c.compras}</TableCell><TableCell className="text-right font-mono font-medium">Q{Number(c.total_gastado ?? c.total).toFixed(2)}</TableCell></TableRow>
          ))}</TableBody>
        </Table>
      </div>
    </div>
  )
}
