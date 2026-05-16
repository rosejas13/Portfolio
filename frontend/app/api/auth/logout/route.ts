import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL

  if (hasSupabase) {
    const supabase = await createClient()
    await supabase.auth.signOut()
  }

  const response = NextResponse.json({ ok: true })

  response.cookies.set('token', '', {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  })

  return response
}
