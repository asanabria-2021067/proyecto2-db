import { useState, useMemo, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { Button } from '@/components/ui/button'
import { Menu, X, Sun, Moon } from 'lucide-react'

export default function PublicNavbar() {
  const auth = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const ctaLabel = useMemo(() => (auth.isLoggedIn ? 'Mi panel' : 'Iniciar sesion'), [auth.isLoggedIn])

  const links = [
    { to: '/', label: 'Inicio' },
    { to: '/catalogo', label: 'Catalogo' },
  ]

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  const handleCta = () => {
    if (auth.isLoggedIn) {
      navigate(auth.rol === 'cliente' ? '/catalogo' : '/dashboard')
    } else {
      navigate('/login')
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/40 bg-background/85 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 text-base font-bold tracking-tight text-foreground sm:text-lg">
          Tienda de Libros y mangas
        </Link>

        <div className="hidden flex-1 items-center gap-1 pl-2 md:flex">
          {links.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`inline-flex h-9 items-center rounded-md px-3 text-sm font-semibold leading-none transition-all duration-200 hover:bg-primary/10 hover:text-primary active:scale-[0.98] ${location.pathname === link.to ? '!bg-primary/15 !text-primary shadow-sm' : 'text-muted-foreground'}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="ml-auto hidden items-center gap-2 md:flex">
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          {!auth.isLoggedIn && (
            <Button
              variant="outline"
              className="inline-flex h-9 items-center px-4 text-sm leading-none transition-all duration-200 hover:border-primary/40 hover:bg-primary/5 hover:text-primary active:scale-[0.98]"
              onClick={() => navigate('/register')}
            >
              Registrarse
            </Button>
          )}
          <Button
            className="inline-flex h-9 items-center px-4 text-sm leading-none transition-all duration-200 hover:shadow-md active:scale-[0.98]"
            onClick={handleCta}
          >
            {ctaLabel}
          </Button>
        </div>

        <Button variant="ghost" size="icon" className="ml-auto h-9 w-9 md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {mobileOpen && (
        <div className="space-y-1 border-t border-border/70 bg-background/95 px-4 pb-4 pt-2 md:hidden">
          {links.map(link => (
            <Link
              key={`mobile-${link.to}`}
              to={link.to}
              className={`block rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent/70 hover:text-foreground ${location.pathname === link.to ? '!bg-primary/10 !text-primary' : 'text-muted-foreground'}`}
            >
              {link.label}
            </Link>
          ))}
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
          </Button>
          {!auth.isLoggedIn && (
            <Button variant="outline" className="h-9 w-full text-sm leading-none" onClick={() => navigate('/register')}>
              Registrarse
            </Button>
          )}
          <Button className="h-9 w-full text-sm leading-none" onClick={handleCta}>
            {ctaLabel}
          </Button>
        </div>
      )}
    </header>
  )
}
