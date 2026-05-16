import { NextResponse } from 'next/server'
import { API_URL, SUPABASE_ANON_KEY } from '@/lib/config'

export const dynamic = 'force-dynamic'

export async function GET() {
  const testUrl = `${API_URL}/rpc/get_site_config`
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (SUPABASE_ANON_KEY) {
      headers['apikey'] = SUPABASE_ANON_KEY
      headers['Authorization'] = `Bearer ${SUPABASE_ANON_KEY}`
    }
    const res = await fetch(testUrl, { headers })
    const body = await res.text()
    return NextResponse.json({
      api_url: API_URL,
      has_key: !!SUPABASE_ANON_KEY,
      key_len: SUPABASE_ANON_KEY.length,
      health_status: res.status,
      health_body: body.substring(0, 200),
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    return NextResponse.json({
      api_url: API_URL,
      has_key: !!SUPABASE_ANON_KEY,
      key_len: SUPABASE_ANON_KEY.length,
      error: msg,
    })
  }
}
