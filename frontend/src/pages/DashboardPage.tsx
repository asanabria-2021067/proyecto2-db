import { useState, useEffect, useMemo, useCallback } from 'react'
import reporteService from '@/services/reporte.service'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts'
import { useError } from '@/hooks/useSwal'
import { Download, TrendingUp, Package, Users, AlertTriangle } from 'lucide-react'
import gsap from 'gsap'

export default function DashboardPage() {
  const [topProd, setTopProd] = useState<any[]>([])
  const [ventasMes, setVentasMes] = useState<any[]>([])
  const [stockBajo, setStockBajo] = useState<any[]>([])
  const [ranking, setRanking] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      reporteService.topProductos().then(r => setTopProd(r.data)),
      reporteService.ventasPorMes().then(r => setVentasMes(r.data)),
      reporteService.stockBajo().then(r => setStockBajo(r.data)),
      reporteService.rankingClientes().then(r => setRanking(r.data)),
    ]).catch(() => useError('Error', 'Error cargando reportes')).finally(() => {
      setLoading(false)
      requestAnimationFrame(() => gsap.from('.dash-card', { y: 20, duration: 0.3, stagger: 0.05, ease: 'power2.out' }))
    })
  }, [])

  const barData = useMemo(() => topProd.map(p => ({ name: String(p.titulo).substring(0, 20), total: Number(p.total_vendido) })), [topProd])
  const lineData = useMemo(() => ventasMes.map(v => ({ mes: v.mes, total: Number(v.total) })), [ventasMes])

  const exportCsv = useCallback(async () => {
    try {
      const res = await reporteService.exportCsv()
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a'); a.href = url; a.download = 'ventas.csv'; a.click(); window.URL.revokeObjectURL(url)
    } catch { useError('Error', 'Error al exportar CSV') }
  }, [])

  if (loading) return <div className="py-16 text-center text-muted-foreground">Cargando dashboard...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button variant="outline" className="gap-2" onClick={exportCsv}><Download className="h-4 w-4" />Exportar CSV</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="dash-card"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Top Productos</CardTitle><TrendingUp className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{topProd.length}</div></CardContent></Card>
        <Card className="dash-card"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Stock Bajo</CardTitle><AlertTriangle className="h-4 w-4 text-destructive" /></CardHeader><CardContent><div className="text-2xl font-bold text-destructive">{stockBajo.length}</div></CardContent></Card>
        <Card className="dash-card"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Meses con Ventas</CardTitle><Package className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{ventasMes.length}</div></CardContent></Card>
        <Card className="dash-card"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Top Clientes</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{ranking.length}</div></CardContent></Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="dash-card"><CardHeader><CardTitle className="text-base">Top 10 Productos Mas Vendidos</CardTitle></CardHeader><CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%"><BarChart data={barData}><XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-25} textAnchor="end" height={60} /><YAxis /><Tooltip /><Bar dataKey="total" fill="oklch(0.49 0.17 255)" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer>
        </CardContent></Card>
        <Card className="dash-card"><CardHeader><CardTitle className="text-base">Ventas por Mes</CardTitle></CardHeader><CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%"><LineChart data={lineData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="mes" /><YAxis /><Tooltip /><Line type="monotone" dataKey="total" stroke="oklch(0.76 0.16 80)" strokeWidth={2} dot={{ r: 4 }} /></LineChart></ResponsiveContainer>
        </CardContent></Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="dash-card"><CardHeader><CardTitle className="text-base flex items-center gap-2">Stock Bajo <Badge variant="destructive">{stockBajo.length}</Badge></CardTitle></CardHeader><CardContent>
          <Table><TableHeader><TableRow><TableHead>Producto</TableHead><TableHead className="text-right">Stock</TableHead></TableRow></TableHeader><TableBody>{stockBajo.slice(0, 10).map((p, i) => (
            <TableRow key={i}><TableCell className="font-medium">{p.titulo}</TableCell><TableCell className="text-right"><Badge variant="destructive">{p.stock}</Badge></TableCell></TableRow>
          ))}</TableBody></Table>
        </CardContent></Card>
        <Card className="dash-card"><CardHeader><CardTitle className="text-base">Ranking Clientes (CTE)</CardTitle></CardHeader><CardContent>
          <Table><TableHeader><TableRow><TableHead>Cliente</TableHead><TableHead className="text-right">Compras</TableHead><TableHead className="text-right">Total</TableHead></TableRow></TableHeader><TableBody>{ranking.slice(0, 10).map((c, i) => (
            <TableRow key={i}><TableCell className="font-medium">{c.nombre ?? c.cliente}</TableCell><TableCell className="text-right">{c.total_compras ?? c.compras}</TableCell><TableCell className="text-right font-mono">Q{Number(c.total_gastado ?? c.total).toFixed(2)}</TableCell></TableRow>
          ))}</TableBody></Table>
        </CardContent></Card>
      </div>
    </div>
  )
}
