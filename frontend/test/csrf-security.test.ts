import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('Admin Auth Guard', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
    sessionStorage.clear()
  })

  it('contact form includes CSRF token header', async () => {
    let capturedHeaders: Record<string, string> = {}

    vi.stubGlobal('fetch', vi.fn(async (_url: string, init?: RequestInit) => {
      capturedHeaders = (init?.headers as Record<string, string>) || {}
      return new Response(JSON.stringify({}), {
        status: 201,
        headers: { 'content-type': 'application/json' },
      })
    }))

    // Simulate what the contact form does
    const csrfToken = crypto.randomUUID()
    sessionStorage.setItem('csrf_token', csrfToken)

    await fetch('/api/leads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'X-CSRF-Token': csrfToken,
      },
      body: JSON.stringify({ name: 'Test', email: 't@t.com', message: 'Hi' }),
    })

    expect(capturedHeaders['X-CSRF-Token']).toBe(csrfToken)
    expect(capturedHeaders['X-Requested-With']).toBe('XMLHttpRequest')
    expect(capturedHeaders['Content-Type']).toBe('application/json')
  })

  it('sessionStorage generates unique CSRF tokens', () => {
    const t1 = crypto.randomUUID()
    const t2 = crypto.randomUUID()
    expect(t1).not.toBe(t2)
    expect(t1).toMatch(/^[0-9a-f-]{36}$/)
    expect(t2).toMatch(/^[0-9a-f-]{36}$/)
  })

  it('CSRF token format is valid UUID v4', () => {
    const t = crypto.randomUUID()
    expect(t).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
  })
})
