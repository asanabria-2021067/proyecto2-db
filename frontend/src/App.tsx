import { Routes, Route, useLocation } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Navbar from './components/layout/Navbar'
import PublicNavbar from './components/layout/PublicNavbar'
import ProtectedRoute from './components/ProtectedRoute'
import { lazy, Suspense } from 'react'

const LandingPage = lazy(() => import('./pages/LandingPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const CatalogoPage = lazy(() => import('./pages/CatalogoPage'))
const CarritoPage = lazy(() => import('./pages/CarritoPage'))
const MisComprasPage = lazy(() => import('./pages/MisComprasPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const ProductosPage = lazy(() => import('./pages/ProductosPage'))
const ClientesPage = lazy(() => import('./pages/ClientesPage'))
const VentasPage = lazy(() => import('./pages/VentasPage'))
const VentaDetallePage = lazy(() => import('./pages/VentaDetallePage'))
const ComprasPage = lazy(() => import('./pages/ComprasPage'))
const CompraDetallePage = lazy(() => import('./pages/CompraDetallePage'))
const ProductosNoVendidosPage = lazy(() => import('./pages/ProductosNoVendidosPage'))
const ClientesSobrePromedioPage = lazy(() => import('./pages/ClientesSobrePromedioPage'))
const NuevaCompraPage = lazy(() => import('./pages/NuevaCompraPage'))

function Loading() {
  return <div className="flex items-center justify-center py-20 text-muted-foreground">Cargando...</div>
}

export default function App() {
  const { isLoggedIn } = useAuth()
  const location = useLocation()

  const isFullPage = location.pathname === '/login' || location.pathname === '/register'
  const isLanding = location.pathname === '/'
  const showPrivateNavbar = isLoggedIn && !isFullPage
  const showPublicNavbar = !isLoggedIn && !isFullPage

  return (
    <>
      {showPrivateNavbar && <Navbar />}
      {showPublicNavbar && <PublicNavbar />}
      <main className={isFullPage || isLanding ? '' : 'mx-auto max-w-7xl px-4 py-6 sm:px-6'}>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/catalogo" element={<CatalogoPage />} />
            <Route path="/carrito" element={<CarritoPage />} />
            <Route path="/mis-compras" element={<ProtectedRoute roles={['cliente']}><MisComprasPage /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute roles={['admin', 'vendedor']}><DashboardPage /></ProtectedRoute>} />
            <Route path="/productos" element={<ProtectedRoute roles={['admin', 'vendedor']}><ProductosPage /></ProtectedRoute>} />
            <Route path="/clientes" element={<ProtectedRoute roles={['admin', 'vendedor']}><ClientesPage /></ProtectedRoute>} />
            <Route path="/ventas" element={<ProtectedRoute roles={['admin', 'vendedor']}><VentasPage /></ProtectedRoute>} />
            <Route path="/ventas/:id" element={<ProtectedRoute roles={['admin', 'vendedor']}><VentaDetallePage /></ProtectedRoute>} />
            <Route path="/compras" element={<ProtectedRoute roles={['admin', 'vendedor']}><ComprasPage /></ProtectedRoute>} />
            <Route path="/compras/nueva" element={<ProtectedRoute roles={['admin', 'vendedor']}><NuevaCompraPage /></ProtectedRoute>} />
            <Route path="/compras/:id" element={<ProtectedRoute roles={['admin', 'vendedor']}><CompraDetallePage /></ProtectedRoute>} />
            <Route path="/reportes/productos-no-vendidos" element={<ProtectedRoute roles={['admin', 'vendedor']}><ProductosNoVendidosPage /></ProtectedRoute>} />
            <Route path="/reportes/clientes-sobre-promedio" element={<ProtectedRoute roles={['admin', 'vendedor']}><ClientesSobrePromedioPage /></ProtectedRoute>} />
          </Routes>
        </Suspense>
      </main>
    </>
  )
}
