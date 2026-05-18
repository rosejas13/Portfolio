import { API_URL, authHeaders, verifyTurnstile, MAX_NAME_LENGTH, MAX_EMAIL_LENGTH, MAX_MESSAGE_LENGTH } from '@/lib/config'

export async function POST(request: Request) {
  let body: { name?: string; email?: string; message?: string; turnstile?: string }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid body' }, { status: 400 })
  }

  if (!await verifyTurnstile(body.turnstile || '')) {
    return Response.json({ error: 'Security check failed. Please try again.' }, { status: 400 })
  }

  const { name, email, message } = body
  if (!name || !email || !message) {
    return Response.json({ error: 'Name, email, and message are required' }, { status: 400 })
  }

  try {
    const res = await fetch(`${API_URL}/leads`, {
      method: 'POST',
      headers: authHeaders({ Prefer: 'return=minimal' }),
      body: JSON.stringify({
        name: String(name).trim().slice(0, MAX_NAME_LENGTH),
        email: String(email).trim().slice(0, MAX_EMAIL_LENGTH),
        message: String(message).trim().slice(0, MAX_MESSAGE_LENGTH),
      }),
    })

    if (!res.ok) {
      return Response.json({ error: 'Failed to send. Please try again.' }, { status: 502 })
    }

    return Response.json({ ok: true })
  } catch {
    return Response.json({ error: 'Failed to send. Please try again.' }, { status: 502 })
  }
}
