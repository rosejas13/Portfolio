export async function POST(request: Request) {
  const BOT_TOKEN = process.env.SLACK_BOT_TOKEN
  const CHANNEL = process.env.SLACK_CHANNEL
  const webhookUrl = process.env.SLACK_WEBHOOK_URL

  let body: { email?: string; deletedCount?: number }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid body' }, { status: 400 })
  }

  const { email, deletedCount } = body
  if (!email) return Response.json({ error: 'Missing email' }, { status: 400 })

  if (BOT_TOKEN && CHANNEL) {
    try {
      await fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${BOT_TOKEN}`,
        },
        body: JSON.stringify({
          channel: CHANNEL,
          text: `🗑 Deletion processed for \`${email}\``,
          blocks: [{
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `🗑 *Deletion request processed*\nEmail: \`${email}\`\nRows removed from database: *${deletedCount ?? 'unknown'}*\n\n⚠️ Delete any messages containing this email from the Slack channel manually.`,
            },
          }],
        }),
      })
      return Response.json({ ok: true })
    } catch { /* fall through */ }
  }

  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: `🗑 Deletion request: ${email} — ${deletedCount} rows removed from DB. Delete any matching Slack messages.` }),
      })
      return Response.json({ ok: true })
    } catch { /* fire and forget */ }
  }

  return Response.json({ ok: true })
}
