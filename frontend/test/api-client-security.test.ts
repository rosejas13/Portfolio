import { describe, it, expect, vi, beforeEach } from 'vitest'

// We test the error message logic by mocking fetch
describe('API Client - Security', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  async function simulateFetchResponse(status: number, body?: unknown, contentType = 'application/json') {
    const res = new Response(
      body ? JSON.stringify(body) : null,
      {
        status,
        headers: { 'content-type': contentType },
      }
    )
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(res))
  }

  it('returns generic "Unauthorized" for 401 status', async () => {
    simulateFetchResponse(401, { message: 'JWT expired', detail: 'token is invalid', hint: 'refresh' })
    // Dynamic import to test the actual module
    const { get } = await import('@/lib/api-client')
    await expect(get('/projects')).rejects.toThrow('Unauthorized')
  })

  it('returns generic "Unauthorized" for 403 status', async () => {
    simulateFetchResponse(403, { message: 'Permission denied', detail: 'RLS policy rejected' })
    const { get } = await import('@/lib/api-client')
    await expect(get('/projects')).rejects.toThrow('Unauthorized')
  })

  it('returns generic rate-limit message for 429 status', async () => {
    simulateFetchResponse(429, { message: 'Rate limit exceeded' })
    const { get } = await import('@/lib/api-client')
    await expect(get('/projects')).rejects.toThrow('Too many requests')
  })

  it('returns generic server error for 500 status', async () => {
    simulateFetchResponse(500, { message: 'Internal error', detail: 'division by zero', hint: 'contact admin' })
    const { get } = await import('@/lib/api-client')
    await expect(get('/projects')).rejects.toThrow('Server error')
  })

  it('never exposes server error details in the thrown message', async () => {
    simulateFetchResponse(400, {
      message: 'new row violates row-level security policy',
      detail: 'policy "anon_insert_leads" for table "leads"',
      hint: 'check source and status fields',
    })
    const { post } = await import('@/lib/api-client')
    await expect(post('/leads', {})).rejects.toThrow('Request failed')
    // Verify the error message does NOT contain any DB internals
    await expect(post('/leads', {})).rejects.not.toThrow('row-level')
    await expect(post('/leads', {})).rejects.not.toThrow('policy')
    await expect(post('/leads', {})).rejects.not.toThrow('anon_insert_leads')
  })
})
