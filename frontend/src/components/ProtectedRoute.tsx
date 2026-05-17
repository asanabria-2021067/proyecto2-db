import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  roles?: string[]
}

export default function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { isLoggedIn, rol } = useAuth()

  if (!isLoggedIn) return <Navigate to="/login" replace />

  if (roles && !roles.includes(rol)) {
    if (rol === 'cliente') return <Navigate to="/catalogo" replace />
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
