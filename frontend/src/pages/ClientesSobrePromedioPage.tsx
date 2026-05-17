import { useState, useEffect } from 'react'
import reporteService from '@/services/reporte.service'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { motion } from 'framer-motion'

export default function ClientesSobrePromedioPage() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { reporteService.clientesSobrePromedio().then(r => { setData(r.data); setLoading(false) }).catch(() => setLoading(false)) }, [])

  if (loading) return <div className="py-16 text-center text-muted-foreground">Cargando...</div>

  return (
    <div>
      <div className="flex items-center gap-3 mb-6"><h1 className="text-2xl font-bold">Clientes Sobre el Promedio</h1><Badge variant="secondary" className="text-xs">{data.length} clientes</Badge></div>
      <p className="text-sm text-muted-foreground mb-4">Clientes cuyo gasto total esta sobre el promedio general (subquery con HAVING).</p>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className="rounded-lg border bg-card shadow-sm">
          <Table>
            <TableHeader><TableRow><TableHead>Cliente</TableHead><TableHead>Email</TableHead><TableHead className="text-right">Total Gastado</TableHead></TableRow></TableHeader>
            <TableBody>{data.map((c, i) => (
              <TableRow key={i} className="hover:bg-muted/50 transition-colors">
                <TableCell className="font-medium">{c.nombre}</TableCell>
                <TableCell className="text-muted-foreground">{c.email ?? '-'}</TableCell>
                <TableCell className="text-right font-mono font-medium text-primary">Q{Number(c.total_gastado).toFixed(2)}</TableCell>
              </TableRow>
            ))}</TableBody>
          </Table>
        </div>
      </motion.div>
    </div>
  )
}
