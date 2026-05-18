export async function POST(request: Request) {
  const BOT_TOKEN = process.env.SLACK_BOT_TOKEN
  const CHANNEL = process.env.SLACK_CHANNEL

  if (!BOT_TOKEN) return Response.json({ error: 'No bot token' }, { status: 501 })
  if (!CHANNEL) return Response.json({ error: 'No channel' }, { status: 501 })

  let body: { name?: string; email?: string; message?: string }
  try { body = await request.json() } catch { return Response.json({ error: 'Invalid body' }, { status: 400 }) }
  const { name, email, message } = body
  if (!name && !email && !message) return Response.json({ error: 'Empty payload' }, { status: 400 })

  const text = `📬 *New contact from ${name || 'Unknown'}*\nEmail: ${email || '—'}\n${(message || '').slice(0, 1500)}`

  try {
    const res = await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        Authorization: `Bearer ${BOT_TOKEN}`,
      },
      body: JSON.stringify({ channel: CHANNEL, text }),
      signal: AbortSignal.timeout(8000),
    })
    const json = await res.json() as { ok?: boolean; error?: string }
    if (json.ok) return Response.json({ ok: true })
    return Response.json({ ok: false, slack_error: json.error }, { status: 200 })
  } catch (err) {
    return Response.json({ ok: false, error: err instanceof Error ? err.message : 'fetch failed' }, { status: 200 })
  }
}
