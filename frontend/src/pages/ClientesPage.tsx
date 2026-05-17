import { useState, useEffect, useMemo, useCallback } from 'react'
import clienteService from '@/services/cliente.service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { showConfirm, showSuccess, showError } from '@/hooks/useSwal'

export default function ClientesPage() {
  const [clientes, setClientes] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '', direccion: '' })
  const [formErrors, setFormErrors] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const perPage = 10

  const totalPages = useMemo(() => Math.max(1, Math.ceil(clientes.length / perPage)), [clientes])
  const paginated = useMemo(() => clientes.slice((page - 1) * perPage, page * perPage), [clientes, page])

  const load = useCallback(async () => {
    try { const r = await clienteService.getAll(); setClientes(r.data) } catch { showError('Error', 'No se pudieron cargar los clientes') }
  }, [])

  const validate = useCallback(() => {
    const errs: string[] = []; if (!form.nombre.trim()) errs.push('Nombre requerido'); return errs
  }, [form])

  const save = useCallback(async (e: React.FormEvent) => {
    e.preventDefault(); const errs = validate(); setFormErrors(errs); if (errs.length) return
    try {
      if (editing) { await clienteService.update(editing.id_cliente, form); await showSuccess('Actualizado', 'Cliente actualizado') }
      else { await clienteService.create(form); await showSuccess('Creado', 'Cliente creado') }
      setShowForm(false); await load()
    } catch (err: any) { showError('Error', err.response?.data?.error ?? 'Error al guardar') }
  }, [form, editing, validate, load])

  const remove = useCallback(async (id: number) => {
    const r = await showConfirm({ title: 'Eliminar cliente?', text: 'Esta accion no se puede deshacer.', confirmText: 'Si, eliminar' })
    if (!r.isConfirmed) return
    try { await clienteService.remove(id); await showSuccess('Eliminado', 'Cliente eliminado'); await load() }
    catch (err: any) { showError('Error', err.response?.data?.error ?? 'Error al eliminar') }
  }, [load])

  useEffect(() => { load() }, [load])

  const set = (f: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(p => ({ ...p, [f]: e.target.value }))

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3"><h1 className="text-2xl font-bold">Clientes</h1><Badge variant="secondary" className="text-xs">{clientes.length} total</Badge></div>
        <Button className="gap-1.5 hover:scale-105" onClick={() => { setEditing(null); setForm({ nombre: '', email: '', telefono: '', direccion: '' }); setShowForm(true) }}>+ Nuevo Cliente</Button>
      </div>
      <div className="rounded-lg border bg-card shadow-sm">
        <Table>
          <TableHeader><TableRow className="hover:bg-transparent"><TableHead className="w-16">ID</TableHead><TableHead>Nombre</TableHead><TableHead>Email</TableHead><TableHead>Telefono</TableHead><TableHead>Direccion</TableHead><TableHead>Usuario</TableHead><TableHead className="text-right">Acciones</TableHead></TableRow></TableHeader>
          <TableBody>
            {paginated.map(c => (
              <TableRow key={c.id_cliente} className="hover:bg-muted/50">
                <TableCell className="font-mono text-muted-foreground text-xs">{c.id_cliente}</TableCell>
                <TableCell className="font-medium">{c.nombre}</TableCell>
                <TableCell className="text-muted-foreground">{c.email ?? '-'}</TableCell>
                <TableCell className="text-muted-foreground">{c.telefono ?? '-'}</TableCell>
                <TableCell className="text-muted-foreground max-w-40 truncate">{c.direccion ?? '-'}</TableCell>
                <TableCell className="text-muted-foreground">{c.username ?? '-'}</TableCell>
                <TableCell className="text-right"><div className="flex items-center justify-end gap-1">
                  <Button variant="outline" size="sm" className="h-7 px-2.5 text-xs hover:text-primary" onClick={() => { setEditing(c); setForm({ nombre: c.nombre, email: c.email ?? '', telefono: c.telefono ?? '', direccion: c.direccion ?? '' }); setShowForm(true) }}>Editar</Button>
                  <Button variant="outline" size="sm" className="h-7 px-2.5 text-xs text-destructive border-destructive/30 hover:bg-destructive hover:text-white" onClick={() => remove(c.id_cliente)}>Eliminar</Button>
                </div></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Pagina {page} de {totalPages}</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Anterior</Button>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Siguiente</Button>
        </div>
      </div>
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{editing ? 'Editar' : 'Nuevo'} Cliente</DialogTitle></DialogHeader>
          {formErrors.length > 0 && <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive space-y-1">{formErrors.map(e => <div key={e}>{e}</div>)}</div>}
          <form onSubmit={save} className="space-y-4">
            <div className="space-y-2"><Label>Nombre *</Label><Input value={form.nombre} onChange={set('nombre')} required /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Email</Label><Input type="email" value={form.email} onChange={set('email')} /></div>
              <div className="space-y-2"><Label>Telefono</Label><Input value={form.telefono} onChange={set('telefono')} /></div>
            </div>
            <div className="space-y-2"><Label>Direccion</Label><Input value={form.direccion} onChange={set('direccion')} /></div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
              <Button type="submit">Guardar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
