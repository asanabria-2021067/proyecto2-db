import { useState, useMemo, useEffect, useCallback } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'
import { useTheme } from '@/contexts/ThemeContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { useConfirm } from '@/hooks/useSwal'
import { ShoppingCart, Menu, X, Sun, Moon } from 'lucide-react'

const adminLinks = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/productos', label: 'Productos' },
  { to: '/clientes', label: 'Clientes' },
  { to: '/ventas', label: 'Ventas' },
  { to: '/compras', label: 'Compras' },
  { to: '/reportes/productos-no-vendidos', label: 'No Vendidos' },
  { to: '/reportes/clientes-sobre-promedio', label: 'Top Clientes' },
  { to: '/catalogo', label: 'Catalogo' },
]

const clienteLinks = [
  { to: '/catalogo', label: 'Catalogo' },
  { to: '/carrito', label: 'Carrito' },
  { to: '/mis-compras', label: 'Mis Compras' },
]

export default function Navbar() {
  const auth = useAuth()
  const cart = useCart()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const visibleLinks = useMemo(() => {
    if (auth.rol === 'cliente') return clienteLinks
    if (auth.rol === 'admin' || auth.rol === 'vendedor') return adminLinks
    return []
  }, [auth.rol])

  const brandTarget = useMemo(() => {
    if (auth.rol === 'admin' || auth.rol === 'vendedor') return '/dashboard'
    return '/catalogo'
  }, [auth.rol])

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  const handleLogout = useCallback(async () => {
    const result = await useConfirm({
      title: 'Cerrar sesion?',
      text: 'Se cerrara tu sesion actual.',
      icon: 'question',
      confirmText: 'Si, salir',
    })
    if (!result.isConfirmed) return
    auth.logout()
    navigate('/')
  }, [auth, navigate])

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link
          to={brandTarget}
          className="group flex items-center gap-2 text-base font-bold tracking-tight text-foreground transition-colors duration-200 hover:text-primary sm:text-lg"
        >
          Tienda de Libros y mangas
        </Link>

        <div className="hidden h-7 w-px bg-border md:block" />

        <div className="hidden flex-1 items-center gap-1 md:flex">
          {visibleLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`inline-flex h-9 items-center rounded-md px-3 text-sm font-semibold leading-none transition-all duration-200 hover:bg-primary/10 hover:text-primary active:scale-[0.98] ${location.pathname === link.to ? '!bg-primary/10 !text-primary shadow-sm' : 'text-muted-foreground'}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {auth.rol === 'cliente' && (
          <Button variant="ghost" size="icon" className="relative hidden h-9 w-9 rounded-full md:inline-flex" onClick={() => navigate('/carrito')}>
            <ShoppingCart className="h-4 w-4" />
            {cart.count > 0 && (
              <Badge variant="secondary" className="absolute -right-1 -top-1 h-5 min-w-5 rounded-full px-1 text-[10px]">
                {cart.count}
              </Badge>
            )}
          </Button>
        )}

        <Button variant="ghost" size="icon" className="hidden h-9 w-9 md:inline-flex" onClick={toggleTheme}>
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        <Button variant="ghost" size="icon" className="ml-auto h-9 w-9 md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative hidden h-9 w-9 overflow-hidden rounded-full p-0 transition-all duration-200 hover:scale-105 hover:ring-2 hover:ring-primary/20 md:flex">
              <div className="flex h-full w-full items-center justify-center bg-primary text-primary-foreground font-bold leading-none">
                {auth.user?.username?.charAt(0).toUpperCase()}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-semibold">{auth.user?.username}</span>
                <span className="text-xs text-muted-foreground capitalize">Rol: {auth.rol}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-destructive cursor-pointer transition-colors duration-150 focus:text-destructive focus:bg-destructive/10"
            >
              Cerrar sesion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {mobileOpen && (
        <div className="border-t border-border/70 bg-background/95 px-4 pb-4 pt-2 md:hidden animate-in slide-in-from-top-2">
          <div className="space-y-1">
            {visibleLinks.map(link => (
              <Link
                key={`mobile-${link.to}`}
                to={link.to}
                className={`block rounded-md px-3 py-2 text-sm font-semibold leading-none transition-colors hover:bg-primary/10 hover:text-primary ${location.pathname === link.to ? '!bg-primary/10 !text-primary' : 'text-muted-foreground'}`}
              >
                {link.label}
              </Link>
            ))}
            <Button variant="ghost" size="sm" className="w-full justify-start gap-2" onClick={toggleTheme}>
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
            </Button>
            <button
              type="button"
              className="mt-1 w-full rounded-md border border-destructive/30 px-3 py-2 text-left text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
              onClick={handleLogout}
            >
              Cerrar sesion
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}
