export async function POST(request: Request) {
  const BOT_TOKEN = process.env.SLACK_BOT_TOKEN
  const CHANNEL = process.env.SLACK_CHANNEL
  const webhookUrl = process.env.SLACK_WEBHOOK_URL

  if (!BOT_TOKEN && !webhookUrl) {
    return Response.json({ error: 'No Slack configuration' }, { status: 501 })
  }

  let body: { name?: string; email?: string; message?: string }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid body' }, { status: 400 })
  }

  const { name, email, message } = body
  if (!name && !email && !message) {
    return Response.json({ error: 'Empty payload' }, { status: 400 })
  }

  const text = `📬 *New contact from portfolio*\n*Name:* ${name || '—'}\n*Email:* ${email || '—'}\n*Message:* ${(message || '').slice(0, 1500)}`

  if (BOT_TOKEN && CHANNEL) {
    try {
      const res = await fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          Authorization: `Bearer ${BOT_TOKEN}`,
        },
        body: JSON.stringify({
          channel: CHANNEL,
          text,
        }),
      })
      const json = await res.json() as { ok?: boolean; error?: string }
      if (json.ok) return Response.json({ ok: true })
      return Response.json({ error: `Slack: ${json.error || 'unknown'}` }, { status: 502 })
    } catch (err) {
      return Response.json({ error: `Slack unreachable: ${err instanceof Error ? err.message : 'unknown'}` }, { status: 502 })
    }
  }

  if (webhookUrl) {
    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      if (res.ok) return Response.json({ ok: true })
    } catch { /* fire and forget */ }
  }

  return Response.json({ error: 'Slack notification failed' }, { status: 502 })
}
