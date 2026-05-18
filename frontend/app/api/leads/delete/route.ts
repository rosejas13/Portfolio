export async function POST(request: Request) {
  let body: { email?: string; turnstile?: string }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid body' }, { status: 400 })
  }

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

  const email = (body.email || '').trim().toLowerCase()
  if (!email || !email.includes('@')) {
    return Response.json({ error: 'Valid email address required' }, { status: 400 })
  }

  const API_URL = (process.env.API_URL || 'http://localhost:3001').replace(/\/$/, '')
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    }
    if (anonKey) {
      headers['apikey'] = anonKey
      headers['Authorization'] = `Bearer ${anonKey}`
    }

    const res = await fetch(`${API_URL}/rpc/delete_leads_by_email`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ target_email: email }),
    })

    const data = await res.json() as number | null
    const deletedCount = typeof data === 'number' ? data : 0

    fetch(`${request.url.replace('/api/leads/delete', '')}/api/slack/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, deletedCount }),
    }).catch(() => {})

    return Response.json({
      ok: true,
      message: deletedCount > 0
        ? `${deletedCount} record(s) deleted.`
        : 'No records found for that email.',
    })
  } catch {
    return Response.json({ error: 'Failed to process deletion. Please try again.' }, { status: 502 })
  }
}
