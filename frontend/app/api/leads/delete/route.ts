import { API_URL, authHeaders, verifyTurnstile } from '@/lib/config'

export async function POST(request: Request) {
  let body: { email?: string; turnstile?: string }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid body' }, { status: 400 })
  }

  if (!await verifyTurnstile(body.turnstile || '')) {
    return Response.json({ error: 'Security check failed. Please try again.' }, { status: 400 })
  }

  const email = (body.email || '').trim().toLowerCase()
  if (!email || !email.includes('@')) {
    return Response.json({ error: 'Valid email address required' }, { status: 400 })
  }

  try {
    const headers = authHeaders({ Prefer: 'return=representation' })
    const res = await fetch(`${API_URL}/rpc/delete_leads_by_email`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ target_email: email }),
    })

    const data = await res.json() as number | null
    const deletedCount = typeof data === 'number' ? data : 0

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
