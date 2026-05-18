export async function POST(request: Request) {
  const API_URL = (process.env.API_URL || 'http://localhost:3001').replace(/\/$/, '')
  const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET_KEY

  let body: { name?: string; email?: string; message?: string; turnstile?: string }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid body' }, { status: 400 })
  }

  // Verify Turnstile token
  if (TURNSTILE_SECRET && TURNSTILE_SECRET !== '1x0000000000000000000000000000000AA') {
    if (!body.turnstile) {
      return Response.json({ error: 'Security check required' }, { status: 400 })
    }
    const formData = new FormData()
    formData.append('secret', TURNSTILE_SECRET)
    formData.append('response', body.turnstile)
    const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
    })
    const verifyJson = await verifyRes.json() as { success?: boolean }
    if (!verifyJson.success) {
      return Response.json({ error: 'Security check failed. Please try again.' }, { status: 400 })
    }
  }

  const { name, email, message } = body
  if (!name || !email || !message) {
    return Response.json({ error: 'Name, email, and message are required' }, { status: 400 })
  }

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    }
    if (ANON_KEY) {
      headers['apikey'] = ANON_KEY
      headers['Authorization'] = `Bearer ${ANON_KEY}`
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
      const errText = await res.text().catch(() => '')
      return Response.json({ error: errText || 'Failed to send' }, { status: res.status })
    }

    return Response.json({ ok: true })
  } catch {
    return Response.json({ error: 'Failed to send. Please try again.' }, { status: 502 })
  }
}
