import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ventaService from '@/services/venta.service'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { motion, AnimatePresence } from 'framer-motion'

export default function MisComprasPage() {
  const [compras, setCompras] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    ventaService.getMisCompras()
      .then(r => { setCompras(r.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="py-16 text-center text-muted-foreground">Cargando...</div>

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold">Mis Compras</h1>
        <Badge variant="secondary" className="text-xs">{compras.length} compras</Badge>
      </div>
      {compras.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-4">No tienes compras aun.</p>
          <Button onClick={() => navigate('/catalogo')}>Ir al catalogo</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {compras.map(c => (
            <motion.div
              key={c.id_venta}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <Card
                className="cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/30"
                onClick={() => setExpandedId(expandedId === c.id_venta ? null : c.id_venta)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Compra #{c.id_venta}</CardTitle>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">{new Date(c.fecha).toLocaleDateString('es-GT')}</span>
                      <Badge variant="secondary" className="font-mono font-bold">Q{Number(c.total).toFixed(2)}</Badge>
                    </div>
                  </div>
                </CardHeader>

                <AnimatePresence>
                  {expandedId === c.id_venta && c.detalle && c.detalle.length > 0 && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <CardContent className="pt-0">
                        <div className="border-t pt-3 space-y-2">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Productos</p>
                          {c.detalle.map((d: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-3 rounded-lg bg-muted/50 p-2.5">
                              <div className="h-12 w-9 rounded overflow-hidden bg-muted flex-shrink-0">
                                {d.imagen_url ? (
                                  <img src={d.imagen_url} alt={d.producto} className="h-full w-full object-cover" />
                                ) : (
                                  <div className="h-full w-full bg-gradient-to-br from-primary/20 to-muted" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{d.producto}</p>
                                {d.isbn && <p className="text-[10px] text-muted-foreground font-mono">ISBN: {d.isbn}</p>}
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="text-xs text-muted-foreground">x{d.cantidad}</p>
                                <p className="text-sm font-bold text-primary">Q{(Number(d.precio_unitario) * Number(d.cantidad)).toFixed(2)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </motion.div>
                  )}
                </AnimatePresence>

                {!c.detalle || c.detalle.length === 0 ? (
                  <CardContent className="pt-0">
                    <p className="text-xs text-muted-foreground">Sin detalle disponible</p>
                  </CardContent>
                ) : null}
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
