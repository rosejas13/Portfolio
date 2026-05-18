import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { API_URL } from '@/lib/config'

export async function POST(request: NextRequest) {
  const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL
  const isProduction = process.env.NODE_ENV === 'production'

  try {
    if (hasSupabase) {
      const body = await request.json()
      const { email, password } = body

      if (!email || !password) {
        return NextResponse.json({ error: 'Email and password required' }, { status: 422 })
      }

      const supabase = await createClient()
      const { error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        return NextResponse.json({ error: error.message || 'Login failed' }, { status: 401 })
      }

      return NextResponse.json({ ok: true })
    }

    if (isProduction) {
      return NextResponse.json(
        { error: 'Supabase Auth is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel environment variables.' },
        { status: 501 }
      )
    }

    const res = await fetch(`${API_URL}/rpc/login_dev`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'Login failed' }, { status: res.status })
    }

    const raw = await res.text()
    const jwt = JSON.parse(raw)

    const response = NextResponse.json({ ok: true })
    response.cookies.set('token', jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24,
    })

    return response
  } catch {
    return NextResponse.json({ error: 'Login failed' }, { status: 502 })
  }
}
