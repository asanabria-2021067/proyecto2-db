import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react'
import api from '@/services/api'

interface User {
  id_usuario: number
  username: string
  rol: string
}

interface AuthState {
  token: string
  user: User | null
}

type AuthAction =
  | { type: 'LOGIN'; payload: { token: string; user: User } }
  | { type: 'LOGOUT' }
  | { type: 'RESTORE'; payload: { token: string; user: User } }

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN':
    case 'RESTORE':
      return { token: action.payload.token, user: action.payload.user }
    case 'LOGOUT':
      return { token: '', user: null }
    default:
      return state
  }
}

interface AuthContextType {
  token: string
  user: User | null
  isLoggedIn: boolean
  rol: string
  login: (username: string, password: string) => Promise<void>
  register: (data: { username: string; password: string; nombre: string; email?: string; telefono?: string; direccion?: string }) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

function getInitialState(): AuthState {
  const token = localStorage.getItem('token') ?? ''
  if (token) {
    try {
      const parts = token.split('.')
      const payload = JSON.parse(atob(parts[1]!))
      return { token, user: { id_usuario: payload.id_usuario, username: payload.username, rol: payload.rol } }
    } catch {
      localStorage.removeItem('token')
    }
  }
  return { token: '', user: null }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, null, getInitialState)

  useEffect(() => {
    if (state.token) {
      localStorage.setItem('token', state.token)
    } else {
      localStorage.removeItem('token')
    }
  }, [state.token])

  const login = async (username: string, password: string) => {
    const res = await api.post('/auth/login', { username, password })
    dispatch({ type: 'LOGIN', payload: { token: res.data.token, user: res.data.user } })
  }

  const register = async (data: { username: string; password: string; nombre: string; email?: string; telefono?: string; direccion?: string }) => {
    const res = await api.post('/auth/register', data)
    dispatch({ type: 'LOGIN', payload: { token: res.data.token, user: res.data.user } })
  }

  const logout = () => {
    dispatch({ type: 'LOGOUT' })
  }

  const value: AuthContextType = {
    token: state.token,
    user: state.user,
    isLoggedIn: !!state.token,
    rol: state.user?.rol ?? '',
    login,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
