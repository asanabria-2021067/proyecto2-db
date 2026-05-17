import { useState, useEffect, useMemo, useCallback } from 'react'
import reporteService from '@/services/reporte.service'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts'
import { useError } from '@/hooks/useSwal'
import { Download, TrendingUp, Package, Users, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import gsap from 'gsap'

const CARD_ANIM = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.25 } }

function MiniSlider({ items, renderItem, label }: { items: any[]; renderItem: (item: any, idx: number) => React.ReactNode; label: string }) {
  const pageSize = 5
  const [page, setPage] = useState(0)
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))
  const visible = useMemo(() => items.slice(page * pageSize, (page + 1) * pageSize), [items, page])

  return (
    <div>
      <div className="space-y-1">{visible.map((item, idx) => renderItem(item, page * pageSize + idx))}</div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-3 pt-2 border-t">
          <span className="text-[10px] text-muted-foreground">{items.length} {label}</span>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-6 w-6" disabled={page === 0} onClick={() => setPage(p => p - 1)}><ChevronLeft className="h-3 w-3" /></Button>
            <span className="text-[10px] text-muted-foreground px-1">{page + 1}/{totalPages}</span>
            <Button variant="ghost" size="icon" className="h-6 w-6" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}><ChevronRight className="h-3 w-3" /></Button>
          </div>
        </div>
      )}
    </div>
  )
}

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

  const barData = useMemo(() => topProd.map(p => ({ name: String(p.titulo).substring(0, 18), total: Number(p.total_vendido) })), [topProd])
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
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button variant="outline" size="sm" className="gap-2" onClick={exportCsv}><Download className="h-4 w-4" />Exportar CSV</Button>
      </div>

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Top Productos', value: topProd.length, icon: TrendingUp, color: 'text-primary' },
          { label: 'Stock Bajo', value: stockBajo.length, icon: AlertTriangle, color: 'text-destructive' },
          { label: 'Meses con Ventas', value: ventasMes.length, icon: Package, color: 'text-muted-foreground' },
          { label: 'Top Clientes', value: ranking.length, icon: Users, color: 'text-muted-foreground' },
        ].map((stat, i) => (
          <motion.div key={i} {...CARD_ANIM} transition={{ duration: 0.25, delay: i * 0.04 }}>
            <Card className="dash-card">
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                  <p className={`text-2xl font-bold mt-0.5 ${stat.color}`}>{stat.value}</p>
                </div>
                <stat.icon className={`h-5 w-5 ${stat.color} opacity-60`} />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <motion.div {...CARD_ANIM} transition={{ delay: 0.15 }}>
          <Card className="dash-card">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Top 10 Productos Mas Vendidos</CardTitle></CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}><XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-30} textAnchor="end" height={56} /><YAxis tick={{ fontSize: 10 }} /><Tooltip contentStyle={{ fontSize: 12 }} /><Bar dataKey="total" fill="oklch(0.49 0.17 255)" radius={[4, 4, 0, 0]} /></BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div {...CARD_ANIM} transition={{ delay: 0.2 }}>
          <Card className="dash-card">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Ventas por Mes</CardTitle></CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="mes" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 10 }} /><Tooltip contentStyle={{ fontSize: 12 }} /><Line type="monotone" dataKey="total" stroke="oklch(0.76 0.16 80)" strokeWidth={2} dot={{ r: 3 }} /></LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <motion.div {...CARD_ANIM} transition={{ delay: 0.25 }}>
          <Card className="dash-card">
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2">Stock Bajo <Badge variant="destructive" className="text-[10px]">{stockBajo.length}</Badge></CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-12 gap-2 px-2 pb-2 mb-2 border-b text-xs font-semibold text-muted-foreground">
                <div className="col-span-9">Producto</div>
                <div className="col-span-3 text-right">Stock</div>
              </div>
              <MiniSlider items={stockBajo} label="productos" renderItem={(p) => (
                <div key={p.id_producto} className="grid grid-cols-12 gap-2 items-center py-1.5 px-2 rounded hover:bg-muted/50 transition-colors">
                  <span className="col-span-9 text-sm font-medium truncate">{p.titulo}</span>
                  <div className="col-span-3 text-right">
                    <Badge variant="destructive" className="text-[10px]">{p.stock}</Badge>
                  </div>
                </div>
              )} />
            </CardContent>
          </Card>
        </motion.div>
        <motion.div {...CARD_ANIM} transition={{ delay: 0.3 }}>
          <Card className="dash-card">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Ranking Clientes (CTE)</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-12 gap-2 px-2 pb-2 mb-2 border-b text-xs font-semibold text-muted-foreground">
                <div className="col-span-6">Cliente</div>
                <div className="col-span-3 text-right">Compras</div>
                <div className="col-span-3 text-right">Total</div>
              </div>
              <MiniSlider items={ranking} label="clientes" renderItem={(c) => (
                <div key={c.id_cliente} className="grid grid-cols-12 gap-2 items-center py-1.5 px-2 rounded hover:bg-muted/50 transition-colors">
                  <span className="col-span-6 text-sm font-medium truncate">{c.nombre}</span>
                  <span className="col-span-3 text-xs text-muted-foreground text-right">{c.cantidad_compras} compras</span>
                  <span className="col-span-3 text-sm font-mono font-bold text-primary text-right">Q{Number(c.total_gastado).toFixed(2)}</span>
                </div>
              )} />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
