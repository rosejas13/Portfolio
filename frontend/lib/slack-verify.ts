import { createHmac, timingSafeEqual } from 'crypto'

export function verifySlackRequest(
  body: string,
  headers: { get: (name: string) => string | null },
  signingSecret: string,
  nowMs: number = Date.now()
): boolean {
  const timestamp = headers.get('x-slack-request-timestamp')
  const signature = headers.get('x-slack-signature')

  if (!timestamp || !signature) return false

  // Replay attack protection: reject requests older than 5 minutes
  const ts = parseInt(timestamp, 10)
  if (isNaN(ts) || Math.abs(nowMs / 1000 - ts) > 300) return false

  const base = `v0:${timestamp}:${body}`
  const hmac = createHmac('sha256', signingSecret).update(base).digest('hex')
  const computed = `v0=${hmac}`

  try {
    return timingSafeEqual(Buffer.from(computed), Buffer.from(signature))
  } catch {
    return false
  }
}
