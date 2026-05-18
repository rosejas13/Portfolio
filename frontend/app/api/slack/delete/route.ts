export async function POST(request: Request) {
  const BOT_TOKEN = process.env.SLACK_BOT_TOKEN
  const CHANNEL = process.env.SLACK_CHANNEL

  if (!BOT_TOKEN || !CHANNEL) return Response.json({ ok: true })

  let body: { email?: string; deletedCount?: number }
  try { body = await request.json() } catch { return Response.json({ ok: true }) }

  const { email, deletedCount } = body
  if (!email) return Response.json({ ok: true })

  try {
    await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        Authorization: `Bearer ${BOT_TOKEN}`,
      },
      body: JSON.stringify({
        channel: CHANNEL,
        text: `🗑 Deletion for \`${email}\` — ${deletedCount ?? '?'} rows removed.`,
      }),
      signal: AbortSignal.timeout(8000),
    })
  } catch { /* fire and forget */ }

  return Response.json({ ok: true })
}
