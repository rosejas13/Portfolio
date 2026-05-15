import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const token = request.cookies.get('token')?.value

  if (!token) {
    return NextResponse.json({ role: 'anon' }, { status: 401 })
  }

  const apiUrl = process.env.API_URL || 'http://localhost:3001'

  try {
    const res = await fetch(`${apiUrl}/rpc/whoami`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 502 })
  }
}
