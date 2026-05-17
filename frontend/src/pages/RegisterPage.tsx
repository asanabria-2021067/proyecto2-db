import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { showSuccess, showError } from '@/hooks/useSwal'

export default function RegisterPage() {
  const auth = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '', nombre: '', email: '', telefono: '', direccion: '' })
  const [errors, setErrors] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const validate = useCallback(() => {
    const errs: string[] = []
    if (!form.username.trim() || form.username.trim().length < 3) errs.push('Username min 3 chars')
    if (!form.password || form.password.length < 6) errs.push('Password min 6 chars')
    if (!form.nombre.trim()) errs.push('Nombre requerido')
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.push('Email invalido')
    return errs
  }, [form])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    setErrors(errs)
    if (errs.length > 0) return
    setLoading(true)
    try {
      await auth.register(form)
      await showSuccess('Registro exitoso', 'Tu cuenta ha sido creada')
      navigate('/catalogo')
    } catch (err: any) {
      await showError('Error', err.response?.data?.error ?? 'Error al registrar')
    } finally { setLoading(false) }
  }, [form, validate, auth, navigate])

  const set = (f: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(p => ({ ...p, [f]: e.target.value }))

  return (
    <div className="min-h-screen flex items-center justify-center p-6 sm:p-12">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-foreground">Crear cuenta</h1>
        <p className="text-muted-foreground mt-2 mb-8">Registrate para comprar en la tienda</p>
        {errors.length > 0 && <div className="mb-4 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive border border-destructive/20 space-y-1">{errors.map(e => <p key={e}>{e}</p>)}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2"><Label>Usuario *</Label><Input placeholder="Min 3 chars" value={form.username} onChange={set('username')} /></div>
          <div className="space-y-2"><Label>Password *</Label><Input type="password" placeholder="Min 6 chars" value={form.password} onChange={set('password')} /></div>
          <div className="space-y-2"><Label>Nombre *</Label><Input placeholder="Tu nombre" value={form.nombre} onChange={set('nombre')} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Email</Label><Input type="email" value={form.email} onChange={set('email')} /></div>
            <div className="space-y-2"><Label>Telefono</Label><Input value={form.telefono} onChange={set('telefono')} /></div>
          </div>
          <div className="space-y-2"><Label>Direccion</Label><Input value={form.direccion} onChange={set('direccion')} /></div>
          <Button type="submit" className="w-full h-11" disabled={loading}>{loading ? 'Registrando...' : 'Crear cuenta'}</Button>
          <p className="text-center text-sm text-muted-foreground">Ya tienes cuenta? <a href="/login" className="text-primary font-medium hover:underline" onClick={e => { e.preventDefault(); navigate('/login') }}>Inicia sesion</a></p>
          <Button type="button" variant="ghost" className="w-full text-muted-foreground" onClick={() => navigate('/')}>Volver a inicio</Button>
        </form>
      </div>
    </div>
  )
}
