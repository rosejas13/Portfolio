import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ContactPage from '../contact-page'

beforeEach(() => {
  vi.restoreAllMocks()
  sessionStorage.clear()
  window.turnstile = {
    render: (_: string, config: { callback: (token: string) => void }) => config.callback('test-token'),
    reset: vi.fn(),
  } as unknown as typeof window.turnstile
})

describe('ContactPage', () => {
  it('renders the contact form', () => {
    render(<ContactPage />)
    expect(screen.getByText('Contact')).toBeInTheDocument()
    expect(screen.getByText('Send')).toBeInTheDocument()
  })

  it('shows success message on successful submission', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 201 })))
    render(<ContactPage />)

    const inputs = screen.getAllByRole('textbox')
    fireEvent.change(inputs[0], { target: { value: 'Test User' } })
    fireEvent.change(inputs[1], { target: { value: 'test@example.com' } })
    fireEvent.change(inputs[2], { target: { value: 'Hello!' } })
    fireEvent.click(screen.getByText('Send'))

    await waitFor(() => {
      expect(screen.getByText("Thanks! I'll get back to you soon.")).toBeInTheDocument()
    })
  })

  it('shows error message on failed submission', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 500 })))
    render(<ContactPage />)

    const inputs = screen.getAllByRole('textbox')
    fireEvent.change(inputs[0], { target: { value: 'Test User' } })
    fireEvent.change(inputs[1], { target: { value: 'test@example.com' } })
    fireEvent.change(inputs[2], { target: { value: 'Hello!' } })
    fireEvent.click(screen.getByText('Send'))

    await waitFor(() => {
      expect(screen.getByText('Failed to send. Please try again.')).toBeInTheDocument()
    })
  })

  it('shows rate limit message on 429', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 429 })))
    render(<ContactPage />)

    const inputs = screen.getAllByRole('textbox')
    fireEvent.change(inputs[0], { target: { value: 'Test User' } })
    fireEvent.change(inputs[1], { target: { value: 'test@example.com' } })
    fireEvent.change(inputs[2], { target: { value: 'Hello!' } })
    fireEvent.click(screen.getByText('Send'))

    await waitFor(() => {
      expect(screen.getByText('Too many messages. Please try again later.')).toBeInTheDocument()
    })
  })

  it('sends CSRF token with the request', async () => {
    let capturedHeaders: Record<string, string> = {}
    vi.stubGlobal('fetch', vi.fn(async (_url: string, init?: RequestInit) => {
      capturedHeaders = (init?.headers as Record<string, string>) || {}
      return new Response(null, { status: 201 })
    }))
    render(<ContactPage />)

    const inputs = screen.getAllByRole('textbox')
    fireEvent.change(inputs[0], { target: { value: 'T' } })
    fireEvent.change(inputs[1], { target: { value: 't@t.com' } })
    fireEvent.change(inputs[2], { target: { value: 'Hi' } })
    fireEvent.click(screen.getByText('Send'))

    await waitFor(() => {
      expect(capturedHeaders['X-CSRF-Token']).toMatch(/^[0-9a-f-]{36}$/)
      expect(capturedHeaders['X-Requested-With']).toBe('XMLHttpRequest')
    })
  })
})
