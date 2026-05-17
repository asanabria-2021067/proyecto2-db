import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { BrowserRouter } from 'react-router-dom'

// Mock axios
vi.mock('@/services/api', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
  },
}))

function TestConsumer() {
  const { isLoggedIn, user, logout } = useAuth()
  return (
    <div>
      <span data-testid="logged-in">{String(isLoggedIn)}</span>
      <span data-testid="username">{user?.username ?? 'none'}</span>
      <button data-testid="logout-btn" onClick={logout}>Logout</button>
    </div>
  )
}

function renderWithProviders() {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    </BrowserRouter>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('starts logged out when no token in localStorage', () => {
    renderWithProviders()
    expect(screen.getByTestId('logged-in').textContent).toBe('false')
    expect(screen.getByTestId('username').textContent).toBe('none')
  })

  it('restores session from a valid JWT in localStorage', () => {
    // Create a fake JWT with payload
    const payload = { id_usuario: 1, username: 'admin', rol: 'admin' }
    const fakeToken = `header.${btoa(JSON.stringify(payload))}.sig`
    localStorage.setItem('token', fakeToken)

    renderWithProviders()
    expect(screen.getByTestId('logged-in').textContent).toBe('true')
    expect(screen.getByTestId('username').textContent).toBe('admin')
  })

  it('clears user on logout', async () => {
    const payload = { id_usuario: 1, username: 'admin', rol: 'admin' }
    const fakeToken = `header.${btoa(JSON.stringify(payload))}.sig`
    localStorage.setItem('token', fakeToken)

    renderWithProviders()
    expect(screen.getByTestId('logged-in').textContent).toBe('true')

    await userEvent.click(screen.getByTestId('logout-btn'))

    await waitFor(() => {
      expect(screen.getByTestId('logged-in').textContent).toBe('false')
      expect(screen.getByTestId('username').textContent).toBe('none')
    })
  })
})
