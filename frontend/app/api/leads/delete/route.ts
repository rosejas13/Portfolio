export async function POST(request: Request) {
  const API_URL = (process.env.API_URL || 'http://localhost:3001').replace(/\/$/, '')
  const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET_KEY

  let body: { email?: string; turnstile?: string }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid body' }, { status: 400 })
  }

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

  const email = (body.email || '').trim().toLowerCase()
  if (!email || !email.includes('@')) {
    return Response.json({ error: 'Valid email address required' }, { status: 400 })
  }

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    }
    if (ANON_KEY) {
      headers['apikey'] = ANON_KEY
      headers['Authorization'] = `Bearer ${ANON_KEY}`
    }

    const res = await fetch(`${API_URL}/rpc/delete_leads_by_email`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ target_email: email }),
    })

    const data = await res.json() as number | null
    const deletedCount = typeof data === 'number' ? data : 0

    // Fire-and-forget Slack notification
    fetch(`${request.url.split('/api/leads/delete')[0]}/api/slack/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, deletedCount }),
    }).catch(() => {})

    return Response.json({
      ok: true,
      message: deletedCount > 0
        ? `${deletedCount} record(s) deleted. A notification has been sent. Please also check Slack for any related messages.`
        : 'No records found for that email.',
    })
  } catch {
    return Response.json({ error: 'Failed to process deletion. Please try again.' }, { status: 502 })
  }
}
