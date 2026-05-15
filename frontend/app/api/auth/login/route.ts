import { NextResponse } from 'next/server'

export async function POST() {
  const apiUrl = process.env.API_URL || 'http://localhost:3001'

  try {
    const res = await fetch(`${apiUrl}/rpc/login_dev`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!res.ok) {
      return NextResponse.json(
        { error: 'Login failed' },
        { status: res.status }
      )
    }

    const token = await res.text()
    // PostgREST returns the token as a raw JSON string (quoted)
    const jwt = JSON.parse(token)

    const response = NextResponse.json({ ok: true })

    response.cookies.set('token', jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    })

    return response
  } catch {
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 502 }
    )
  }
}
