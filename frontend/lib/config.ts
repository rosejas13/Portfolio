export const API_URL = (process.env.API_URL || 'http://localhost:3001').replace(/\/$/, '')
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
export const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET_KEY || ''
export const TURNSTILE_TEST_SECRET = '1x0000000000000000000000000000000AA'

export const MAX_NAME_LENGTH = 200
export const MAX_EMAIL_LENGTH = 320
export const MAX_MESSAGE_LENGTH = 5000
export const DEFAULT_LEAD_LIMIT = 5
export const MAX_LEAD_LIMIT = 10

export function authHeaders(extra?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Prefer: 'return=minimal',
    ...extra,
  }
  if (SUPABASE_ANON_KEY) {
    headers['apikey'] = SUPABASE_ANON_KEY
    headers['Authorization'] = `Bearer ${SUPABASE_ANON_KEY}`
  }
  return headers
}

export async function verifyTurnstile(token: string): Promise<boolean> {
  if (!TURNSTILE_SECRET || TURNSTILE_SECRET === TURNSTILE_TEST_SECRET) return true
  if (!token) return false
  const formData = new FormData()
  formData.append('secret', TURNSTILE_SECRET)
  formData.append('response', token)
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: formData,
  })
  const json = await res.json() as { success?: boolean }
  return !!json.success
}
