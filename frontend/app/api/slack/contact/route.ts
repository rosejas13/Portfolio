export async function POST(request: Request) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL
  const BOT_TOKEN = process.env.SLACK_BOT_TOKEN

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

  const text = `*New contact from portfolio*`
  const blocks = [
    {
      type: 'section' as const,
      text: {
        type: 'mrkdwn' as const,
        text: `📬 *New contact from portfolio*\n*Name:* ${name || '—'}\n*Email:* ${email ? `<mailto:${email}|${email}>` : '—'}\n\n*Message:*\n${(message || '').slice(0, 1500)}`,
      },
    },
    {
      type: 'context' as const,
      elements: [{ type: 'mrkdwn' as const, text: 'Use `/leads` to manage contacts.' }],
    },
  ]

  // Try bot token first for rich messages, fall back to webhook
  if (BOT_TOKEN) {
    try {
      await fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${BOT_TOKEN}`,
        },
        body: JSON.stringify({ text, blocks }),
      })
      return Response.json({ ok: true })
    } catch { /* fall through */ }
  }

  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: `${text}\n${name} (${email}): ${(message || '').slice(0, 300)}` }),
      })
      return Response.json({ ok: true })
    } catch { /* fire and forget */ }
  }

  return Response.json({ error: 'Not configured' }, { status: 501 })
}
