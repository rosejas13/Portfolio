export async function POST(request: Request) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL
  const BOT_TOKEN = process.env.SLACK_BOT_TOKEN

  let body: { email?: string; deletedCount?: number }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid body' }, { status: 400 })
  }

  const { email, deletedCount } = body
  if (!email) return Response.json({ error: 'Missing email' }, { status: 400 })

  // Prefer bot token over webhook for richer messages
  if (BOT_TOKEN) {
    try {
      await fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${BOT_TOKEN}`,
        },
        body: JSON.stringify({
          text: `🗑 Deletion processed for \`${email}\``,
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `🗑 *Deletion request processed*\nEmail: \`${email}\`\nRows removed from database: *${deletedCount ?? 'unknown'}*\n\n⚠️ Delete any messages containing this email from the Slack channel manually.`,
              },
            },
          ],
        }),
      })
    } catch { /* fall through to webhook */ }
  }

  // Fallback to webhook
  if (webhookUrl && !BOT_TOKEN) {
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🗑 Deletion request: ${email} — ${deletedCount} rows removed from DB. Delete any matching Slack messages.`,
        }),
      })
    } catch { /* fire and forget */ }
  }

  return Response.json({ ok: true })
}
