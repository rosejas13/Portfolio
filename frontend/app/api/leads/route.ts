export async function POST(request: Request) {
  let body: { name?: string; email?: string; message?: string; turnstile?: string }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid body' }, { status: 400 })
  }

  // Verify Turnstile
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (secret && secret !== '1x0000000000000000000000000000000AA' && body.turnstile) {
    try {
      const fd = new FormData()
      fd.append('secret', secret)
      fd.append('response', body.turnstile)
      const vr = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: fd })
      const vj = await vr.json() as { success?: boolean }
      if (!vj.success) return Response.json({ error: 'Security check failed. Please try again.' }, { status: 400 })
    } catch { /* fail-open */ }
  }

  const { name, email, message } = body
  if (!name || !email || !message) {
    return Response.json({ error: 'Name, email, and message are required' }, { status: 400 })
  }

  const API_URL = (process.env.API_URL || 'http://localhost:3001').replace(/\/$/, '')
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    }
    if (anonKey) {
      headers['apikey'] = anonKey
      headers['Authorization'] = `Bearer ${anonKey}`
    }

    const res = await fetch(`${API_URL}/leads`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: String(name).trim().slice(0, 200),
        email: String(email).trim().slice(0, 320),
        message: String(message).trim().slice(0, 5000),
      }),
    })

    if (!res.ok) {
      const errText = await res.text().catch(() => 'unknown')
      console.error('PostgREST leads insert failed', { status: res.status, body: errText.slice(0, 500) })
      return Response.json({ error: 'Failed to send. Please try again.' }, { status: 502 })
    }

    return Response.json({ ok: true })
  } catch {
    return Response.json({ error: 'Failed to send. Please try again.' }, { status: 502 })
  }
}
