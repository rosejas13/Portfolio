import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockFetch = vi.fn()
global.fetch = mockFetch

describe('POST /api/leads/delete', () => {
  let handler: (request: Request) => Promise<Response>

  beforeEach(async () => {
    vi.resetModules()
    mockFetch.mockReset()
    process.env.API_URL = 'http://localhost:3001'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
    process.env.TURNSTILE_SECRET_KEY = ''
    const mod = await import('@/app/api/leads/delete/route')
    handler = mod.POST
  })

  it('rejects missing email', async () => {
    const res = await handler(new Request('http://localhost/api/leads/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    }))
    expect(res.status).toBe(400)
  })

  it('rejects invalid email format', async () => {
    const res = await handler(new Request('http://localhost/api/leads/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'not-an-email' }),
    }))
    expect(res.status).toBe(400)
  })
})

describe('POST /api/slack/interactions', () => {
  let handler: (request: Request) => Promise<Response>

  beforeEach(async () => {
    vi.resetModules()
    mockFetch.mockReset()
    // Mock verifySlackRequest to always return true
    vi.doMock('@/lib/slack-verify', () => ({
      verifySlackRequest: () => true,
    }))

    process.env.SLACK_SIGNING_SECRET = ''
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
    process.env.API_URL = 'http://localhost:3001'
    const mod = await import('@/app/api/slack/interactions/route')
    handler = mod.POST
  })

  it('handles "read" action', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    } as Response)

    const payload = JSON.stringify({
      actions: [{ value: 'read_42' }],
      user: { id: 'U123', name: 'tester' },
      response_url: 'https://hooks.slack.com/...',
    })
    const formBody = `payload=${encodeURIComponent(payload)}`

    const res = await handler(new Request('http://localhost/api/slack/interactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formBody,
    }))

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.text).toContain('marked as read')
  })

  it('handles "delete" action', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    } as Response)

    const payload = JSON.stringify({
      actions: [{ value: 'delete_99' }],
      user: { id: 'U123', name: 'tester' },
      response_url: 'https://hooks.slack.com/...',
    })
    const formBody = `payload=${encodeURIComponent(payload)}`

    const res = await handler(new Request('http://localhost/api/slack/interactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formBody,
    }))

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.text).toContain('deleted')
  })

  it('handles invalid payload gracefully', async () => {
    const res = await handler(new Request('http://localhost/api/slack/interactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'not-a-form',
    }))
    expect(res.status).toBe(400)
  })
})
