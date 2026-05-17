import { useState, useEffect, useCallback } from 'react'
import api from '@/services/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

interface Props { producto: any | null; onSave: (data: any) => void; onCancel: () => void }

export default function ProductoForm({ producto, onSave, onCancel }: Props) {
  const [form, setForm] = useState({ titulo: '', isbn: '', precio: '', stock: '', anio_publicacion: '', descripcion: '', imagen_url: '', id_categoria: '', id_editorial: '', autores: '' as string })
  const [categorias, setCategorias] = useState<any[]>([])
  const [editoriales, setEditoriales] = useState<any[]>([])
  const [autoresList, setAutoresList] = useState<any[]>([])
  const [errors, setErrors] = useState<string[]>([])

  useEffect(() => {
    api.get('/categorias').then(r => setCategorias(r.data)).catch(() => {})
    api.get('/editoriales').then(r => setEditoriales(r.data)).catch(() => {})
    api.get('/autores').then(r => setAutoresList(r.data)).catch(() => {})
  }, [])

  useEffect(() => {
    if (producto) {
      setForm({
        titulo: producto.titulo ?? '', isbn: producto.isbn ?? '', precio: String(producto.precio ?? ''), stock: String(producto.stock ?? ''),
        anio_publicacion: String(producto.anio_publicacion ?? ''), descripcion: producto.descripcion ?? '', imagen_url: producto.imagen_url ?? '',
        id_categoria: String(producto.id_categoria ?? ''), id_editorial: String(producto.id_editorial ?? ''), autores: String(producto.autor_ids ?? ''),
      })
    }
  }, [producto])

  const validate = useCallback(() => {
    const errs: string[] = []
    if (!form.titulo.trim()) errs.push('Titulo requerido')
    if (!form.precio || Number(form.precio) <= 0) errs.push('Precio debe ser > 0')
    if (form.stock !== '' && Number(form.stock) < 0) errs.push('Stock debe ser >= 0')
    return errs
  }, [form])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate(); setErrors(errs); if (errs.length) return
    const data: any = { titulo: form.titulo, isbn: form.isbn || null, precio: Number(form.precio), stock: Number(form.stock) || 0, anio_publicacion: form.anio_publicacion ? Number(form.anio_publicacion) : null, descripcion: form.descripcion || null, imagen_url: form.imagen_url || null }
    if (form.id_categoria) data.id_categoria = Number(form.id_categoria)
    if (form.id_editorial) data.id_editorial = Number(form.id_editorial)
    if (form.autores) data.autores = form.autores.split(',').map(Number).filter(Boolean)
    onSave(data)
  }

  const set = (f: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm(p => ({ ...p, [f]: e.target.value }))

  return (
    <Dialog open onOpenChange={(v) => { if (!v) onCancel() }}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{producto ? 'Editar' : 'Nuevo'} Producto</DialogTitle></DialogHeader>
        {errors.length > 0 && <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive space-y-1">{errors.map(e => <p key={e}>{e}</p>)}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2"><Label>Titulo *</Label><Input value={form.titulo} onChange={set('titulo')} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>ISBN</Label><Input value={form.isbn} onChange={set('isbn')} /></div>
            <div className="space-y-2"><Label>Año</Label><Input type="number" value={form.anio_publicacion} onChange={set('anio_publicacion')} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Precio *</Label><Input type="number" step="0.01" value={form.precio} onChange={set('precio')} /></div>
            <div className="space-y-2"><Label>Stock</Label><Input type="number" value={form.stock} onChange={set('stock')} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Categoria</Label>
              <Select value={form.id_categoria} onValueChange={v => setForm(p => ({ ...p, id_categoria: v }))}>
                <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                <SelectContent>{categorias.map(c => <SelectItem key={c.id_categoria} value={String(c.id_categoria)}>{c.tipo} - {c.nombre}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Editorial</Label>
              <Select value={form.id_editorial} onValueChange={v => setForm(p => ({ ...p, id_editorial: v }))}>
                <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                <SelectContent>{editoriales.map(e => <SelectItem key={e.id_editorial} value={String(e.id_editorial)}>{e.nombre}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2"><Label>Autores (IDs separados por coma)</Label><Input value={form.autores} onChange={set('autores')} placeholder="1,2,3" /><p className="text-xs text-muted-foreground">Disponibles: {autoresList.map(a => `${a.id_autor}:${a.nombre}`).join(', ')}</p></div>
          <div className="space-y-2"><Label>URL Imagen</Label><Input value={form.imagen_url} onChange={set('imagen_url')} placeholder="https://..." /></div>
          <div className="space-y-2"><Label>Descripcion</Label><Textarea value={form.descripcion} onChange={set('descripcion')} rows={3} /></div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
            <Button type="submit">Guardar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
