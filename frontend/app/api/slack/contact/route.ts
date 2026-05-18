export async function POST(request: Request) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL
  const BOT_TOKEN = process.env.SLACK_BOT_TOKEN
  const CHANNEL = process.env.SLACK_CHANNEL

  if (!webhookUrl && (!BOT_TOKEN || !CHANNEL)) {
    return Response.json({
      error: 'No Slack configuration',
      detail: { webhook: webhookUrl ? 'set' : 'missing', bot: BOT_TOKEN ? 'set' : 'missing', channel: CHANNEL ? 'set' : 'missing' }
    }, { status: 501 })
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

  if (webhookUrl) {
    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      if (res.ok) return Response.json({ ok: true })
    } catch { /* continue to bot token fallback */ }
  }

  if (BOT_TOKEN && CHANNEL) {
    try {
      const res = await fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${BOT_TOKEN}`,
        },
        body: JSON.stringify({
          channel: CHANNEL,
          text,
          blocks: [{
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `📬 *New contact from portfolio*\n*Name:* ${name || '—'}\n*Email:* ${email ? `<mailto:${email}|${email}>` : '—'}\n\n*Message:*\n${(message || '').slice(0, 1500)}`,
            },
          }],
        }),
      })
      const json = await res.json() as { ok?: boolean; error?: string }
      if (json.ok) return Response.json({ ok: true })
      return Response.json({ error: 'Slack notification failed' }, { status: 502 })
    } catch {
      return Response.json({ error: 'Slack unreachable' }, { status: 502 })
    }
  }

  return Response.json({ error: 'No Slack configuration' }, { status: 501 })
}
