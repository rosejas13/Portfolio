import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AdminLogin from '../admin-login'

const mockPush = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('AdminLogin', () => {
  it('renders the login form', () => {
    render(<AdminLogin />)
    expect(screen.getByText('Admin Login')).toBeInTheDocument()
    expect(screen.getByText('Sign in with Dev Account')).toBeInTheDocument()
  })

  it('redirects to admin on successful login', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 })))

    render(<AdminLogin />)
    fireEvent.click(screen.getByText('Sign in with Dev Account'))

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/admin')
    })
  })

  it('shows error message on failed login', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: 'Login failed' }), { status: 401 })))

    render(<AdminLogin />)
    fireEvent.click(screen.getByText('Sign in with Dev Account'))

    await waitFor(() => {
      expect(screen.getByText('Login failed')).toBeInTheDocument()
    })
  })

  it('shows error message when fetch fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')))

    render(<AdminLogin />)
    fireEvent.click(screen.getByText('Sign in with Dev Account'))

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument()
    })
  })
})
