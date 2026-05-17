import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import api from '@/services/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { showSuccess, showError } from '@/hooks/useSwal'
import gsap from 'gsap'

export default function LoginPage() {
  const auth = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const formRef = useRef<HTMLDivElement>(null)
  const collageRef = useRef<HTMLDivElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const [productos, setProductos] = useState<any[]>([])
  const autoScrollTweenRef = useRef<gsap.core.Tween | null>(null)

  const coverImages = useMemo(() => {
    const fallback = 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=80'
    const urls = productos.map(p => p.imagen_url).filter((url): url is string => typeof url === 'string' && url.length > 0)
    return urls.length ? urls : [fallback]
  }, [productos])

  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!username || !password) {
      setError('Username y password son requeridos')
      gsap.fromTo('.login-error', { x: -8 }, { x: 0, duration: 0.4, ease: 'elastic.out(1, 0.3)' })
      return
    }
    setLoading(true)
    try {
      await auth.login(username, password)
      await showSuccess('Bienvenido', `Sesion iniciada como ${username}`)
      if (auth.rol === 'cliente') navigate('/catalogo')
      else navigate('/dashboard')
    } catch {
      setError('Credenciales invalidas')
      await showError('Error de autenticacion', 'Usuario o password incorrectos')
      gsap.fromTo('.login-error', { x: -8 }, { x: 0, duration: 0.4, ease: 'elastic.out(1, 0.3)' })
    } finally {
      setLoading(false)
    }
  }, [username, password, auth, navigate])

  useEffect(() => {
    api.get('/productos').then(res => setProductos(res.data)).catch(() => setProductos([]))
  }, [])

  useEffect(() => {
    if (!formRef.current || !collageRef.current) return
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
    tl.from(collageRef.current, { x: -60, duration: 0.6 })
      .from(formRef.current, { x: 40, duration: 0.5 }, '<0.1')
      .from('.login-title', { y: 20, duration: 0.3 }, '-=0.2')
      .from('.login-subtitle', { y: 15, duration: 0.25 }, '-=0.15')
      .from('.login-field', { y: 15, duration: 0.25, stagger: 0.06 }, '-=0.1')
      .from('.login-btn', { y: 10, duration: 0.25 }, '-=0.05')
      .from('.login-footer', { y: 10, duration: 0.25 }, '-=0.05')

    gsap.to('.cover-float', { y: -8, duration: 3, ease: 'sine.inOut', repeat: -1, yoyo: true, stagger: { each: 0.3 } })

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const scrollEl = scrollAreaRef.current
    if (!scrollEl || reduceMotion) return
    const maxScroll = scrollEl.scrollHeight - scrollEl.clientHeight
    if (maxScroll > 40) {
      autoScrollTweenRef.current = gsap.to(scrollEl, { scrollTop: maxScroll, duration: Math.max(16, maxScroll / 30), ease: 'sine.inOut', repeat: -1, yoyo: true })
    }
    return () => { autoScrollTweenRef.current?.kill() }
  }, [productos])

  return (
    <div className="min-h-screen flex">
      <div ref={collageRef} className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/5 via-background to-accent/10 items-stretch justify-center p-10 relative overflow-hidden">
        <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-accent/15 blur-3xl" />
        <div className="relative z-10 h-full w-full overflow-hidden">
          <div ref={scrollAreaRef} className="h-full w-full overflow-y-auto pr-2" onMouseEnter={() => autoScrollTweenRef.current?.pause()} onMouseLeave={() => autoScrollTweenRef.current?.resume()}>
            <div className="grid w-full grid-cols-6 gap-3 xl:grid-cols-7">
              {coverImages.map((src, i) => (
                <div key={i} className="cover-float aspect-[2/3] rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.03]">
                  <img src={src} alt="Cover" className="h-full w-full object-cover" loading="lazy" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div ref={formRef} className="w-full max-w-sm">
          <h1 className="login-title text-3xl font-bold text-foreground">Bienvenido</h1>
          <p className="login-subtitle text-muted-foreground mt-2 mb-8">Inicia sesion para continuar</p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="login-field space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">Usuario</Label>
              <Input id="username" type="text" placeholder="Tu nombre de usuario" autoFocus value={username} onChange={e => setUsername(e.target.value)} className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary" />
            </div>
            <div className="login-field space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <Input id="password" type="password" placeholder="Tu password" value={password} onChange={e => setPassword(e.target.value)} className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary" />
            </div>

            {error && (
              <div className="login-error rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive border border-destructive/20">{error}</div>
            )}

            <Button type="submit" className="login-btn w-full h-11 text-base font-medium transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/25" disabled={loading}>
              {loading ? 'Ingresando...' : 'Iniciar sesion'}
            </Button>

            <div className="login-footer space-y-3">
              <p className="text-center text-sm text-muted-foreground">
                No tienes cuenta? <a href="/register" className="text-primary font-medium hover:underline" onClick={e => { e.preventDefault(); navigate('/register') }}>Registrate</a>
              </p>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">o</span>
                <div className="flex-1 h-px bg-border" />
              </div>
              <Button type="button" variant="outline" className="w-full transition-all duration-200 hover:bg-accent/50" onClick={() => navigate('/catalogo')}>Explorar catalogo sin cuenta</Button>
              <Button type="button" variant="ghost" className="w-full text-muted-foreground transition-all duration-200 hover:bg-primary/5 hover:text-primary" onClick={() => navigate('/')}>Volver a inicio</Button>
            </div>
          </form>

          <div className="mt-8 p-3 rounded-lg bg-muted/50 border text-xs text-muted-foreground">
            <p className="font-medium mb-1">Cuentas de prueba:</p>
            <p>Admin: <code className="bg-muted px-1 rounded">admin</code> / <code className="bg-muted px-1 rounded">admin123</code></p>
            <p>Vendedor: <code className="bg-muted px-1 rounded">vendedor1</code> / <code className="bg-muted px-1 rounded">vend123</code></p>
            <p>Cliente: <code className="bg-muted px-1 rounded">cliente1</code> / <code className="bg-muted px-1 rounded">cli123</code></p>
          </div>
        </div>
      </div>
    </div>
  )
}
