import { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import api from '@/services/api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import gsap from 'gsap'

const categoryImages: Record<string, string> = {
  MANGA: 'https://images.unsplash.com/photo-1613376023733-0a73315d9b06?auto=format&fit=crop&w=1400&q=80',
  COMIC: 'https://images.unsplash.com/photo-1629992101753-56d196c8aabb?auto=format&fit=crop&w=1400&q=80',
  LIBRO: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=1400&q=80',
  REVISTA: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1400&q=80',
}

export default function LandingPage() {
  const navigate = useNavigate()
  const auth = useAuth()
  const rootRef = useRef<HTMLDivElement>(null)
  const [productos, setProductos] = useState<any[]>([])

  const featured = useMemo(() => productos.filter(p => Number(p.stock) > 0).slice(0, 6), [productos])

  const heroImages = useMemo(() => {
    const fallback = 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=80'
    return {
      first: featured[0]?.imagen_url || fallback,
      second: featured[1]?.imagen_url || featured[0]?.imagen_url || fallback,
      third: featured[2]?.imagen_url || featured[1]?.imagen_url || fallback,
    }
  }, [featured])

  const categories = useMemo(() => {
    const map = new Map<string, { tipo: string; nombre: string; total: number; image: string }>()
    for (const p of productos) {
      const key = `${p.tipo}-${p.categoria}`
      const found = map.get(key)
      if (found) {
        found.total += 1
      } else {
        map.set(key, {
          tipo: String(p.tipo ?? 'GENERAL'),
          nombre: String(p.categoria ?? 'Categoria'),
          total: 1,
          image: categoryImages[String(p.tipo ?? '')] || categoryImages.LIBRO,
        })
      }
    }
    return Array.from(map.values()).slice(0, 6)
  }, [productos])

  const goPanel = useCallback(() => {
    if (auth.isLoggedIn) {
      navigate(auth.rol === 'cliente' ? '/catalogo' : '/dashboard')
      return
    }
    navigate('/login')
  }, [auth, navigate])

  useEffect(() => {
    let ctx: gsap.Context | undefined
    api.get('/productos').then(res => {
      setProductos(res.data)
      requestAnimationFrame(() => {
        if (!rootRef.current) return
        ctx = gsap.context(() => {
          gsap.from('.landing-enter', { y: 20, duration: 0.35, stagger: 0.05, ease: 'power2.out', clearProps: 'transform,opacity' })
          gsap.from('.landing-card', { y: 22, duration: 0.35, stagger: 0.05, delay: 0.2, ease: 'power2.out', clearProps: 'transform,opacity' })
        }, rootRef.current)
      })
    }).catch(() => setProductos([]))
    return () => ctx?.revert()
  }, [])

  return (
    <div ref={rootRef} className="min-h-screen bg-background text-foreground">
      <section className="relative overflow-hidden px-6 pb-20 pt-16">
        <div className="pointer-events-none absolute -left-24 top-8 h-60 w-60 rounded-full bg-primary/15 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 top-24 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="landing-enter">
            <h1 className="font-heading text-6xl font-black italic leading-[0.9] tracking-tight sm:text-8xl lg:text-9xl">
              LIBERA<br />TU PROXIMA<br /><span className="text-primary">AVENTURA</span>
            </h1>
            <p className="mt-7 max-w-xl text-base font-medium leading-relaxed text-muted-foreground sm:text-lg">
              Tienda de Libros y mangas: descubre lanzamientos, clasicos y coleccionables en un solo lugar. Compra facil, carrito claro y seguimiento de tus pedidos.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button className="h-12 rounded-xl px-7 text-base font-black active:scale-[0.98]" onClick={() => navigate('/catalogo')}>Explorar catalogo</Button>
              <Button variant="secondary" className="h-12 rounded-xl px-7 text-base font-bold active:scale-[0.98]" onClick={goPanel}>
                {auth.isLoggedIn ? 'Ir al panel' : 'Iniciar sesion'}
              </Button>
              {!auth.isLoggedIn && (
                <Button variant="outline" className="h-12 rounded-xl px-7 text-base font-bold active:scale-[0.98]" onClick={() => navigate('/register')}>Registrarse</Button>
              )}
            </div>
          </div>
          <div className="landing-enter relative hidden h-[560px] lg:block">
            <div className="absolute inset-0 -rotate-3 overflow-hidden rounded-[2rem] bg-card shadow-xl">
              <img src={heroImages.first} alt="Portada principal" className="h-full w-full object-cover brightness-75" />
            </div>
            <div className="absolute -right-8 -top-8 h-88 w-60 rotate-6 overflow-hidden rounded-xl bg-card shadow-2xl">
              <img src={heroImages.second} alt="Portada secundaria" className="h-full w-full object-cover" />
            </div>
            <div className="absolute -bottom-6 -left-8 flex h-72 w-52 -rotate-12 items-center justify-center rounded-xl bg-sky-200 p-6 text-center text-slate-900 shadow-2xl">
              <span className="font-heading text-3xl font-black italic leading-tight">NOVEDADES DE LA TIENDA</span>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-muted/30 py-20">
        <div className="mx-auto mb-10 flex max-w-7xl items-end justify-between gap-4 px-6">
          <div>
            <h2 className="font-heading text-4xl font-black tracking-tight sm:text-5xl">Novedades Destacadas</h2>
            <p className="mt-2 text-sm text-muted-foreground">Productos recientes disponibles actualmente en la tienda.</p>
            <div className="mt-4 h-1.5 w-32 bg-primary" />
          </div>
        </div>
        <div className="mx-auto grid max-w-7xl gap-7 px-6 md:grid-cols-2 xl:grid-cols-3">
          {featured.map(item => (
            <article key={item.id_producto} className="landing-card group rounded-2xl border bg-card p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
              <div className="aspect-[3/4] overflow-hidden rounded-xl bg-muted">
                <img src={item.imagen_url || 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=80'} alt={item.titulo} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
              <h3 className="mt-4 font-heading text-2xl font-bold">{item.titulo}</h3>
              <p className="text-sm font-medium text-muted-foreground">{item.autores || 'Autor no disponible'}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-primary">{item.tipo} · {item.categoria}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="font-heading text-2xl font-black text-primary">Q{Number(item.precio).toFixed(2)}</span>
                <Button size="sm" className="rounded-lg font-bold active:scale-[0.98]" onClick={() => navigate('/catalogo')}>Ver</Button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-background px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-10 text-center font-heading text-5xl font-black tracking-tight">Categorias de la Tienda</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {categories.map(cat => (
              <article key={`${cat.tipo}-${cat.nombre}`} className="landing-card group relative overflow-hidden rounded-2xl border bg-card">
                <img src={cat.image} alt={cat.nombre} className="h-56 w-full object-cover brightness-75 transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                  <p className="text-[11px] font-black tracking-wider text-white/80">{cat.tipo}</p>
                  <h3 className="font-heading text-2xl font-black">{cat.nombre}</h3>
                  <p className="text-xs text-white/85">{cat.total} productos disponibles</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-12">
        <div className="mx-auto max-w-7xl rounded-[2rem] bg-gradient-to-br from-primary/20 via-accent/15 to-primary/10 border border-primary/20 p-10 md:p-16">
          <Badge className="mb-6 bg-primary/15 border-primary/30 px-4 py-1 text-xs font-black tracking-widest text-primary">PROMOCION DE LA TIENDA</Badge>
          <h3 className="max-w-3xl font-heading text-5xl font-black leading-[0.9] tracking-tight text-foreground md:text-7xl">
            LLEVA 3 Y<br />PAGA SOLO 2
          </h3>
          <p className="mt-6 max-w-xl text-base font-semibold text-muted-foreground">
            Promocion especial de la tienda en seleccion de mangas. Aprovecha para completar colecciones con mejor precio.
          </p>
          <Button className="mt-8 h-12 rounded-xl px-8 font-black active:scale-[0.98]" onClick={() => navigate('/catalogo')}>Comprar oferta</Button>
        </div>
      </section>
    </div>
  )
}
