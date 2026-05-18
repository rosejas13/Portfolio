export async function POST(request: Request) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL
  if (!webhookUrl) {
    return Response.json({ error: 'Not configured' }, { status: 501 })
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

  const text = [
    `*New contact from portfolio*`,
    name ? `*Name:* ${name}` : '',
    email ? `*Email:* ${email}` : '',
    message ? `*Message:*\n${message.slice(0, 1500)}` : '',
  ]
    .filter(Boolean)
    .join('\n')

  try {
    const slackRes = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })

    if (!slackRes.ok) {
      return Response.json({ error: 'Slack rejected' }, { status: 502 })
    }

    return Response.json({ ok: true })
  } catch {
    return Response.json({ error: 'Slack unreachable' }, { status: 502 })
  }
}
