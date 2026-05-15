import { NextRequest, NextResponse } from 'next/server'

const MAX_BODY_SIZE = 1024

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()

    if (body.length > MAX_BODY_SIZE) {
      return NextResponse.json({ ok: false }, { status: 413 })
    }

    let data: Record<string, unknown>
    try {
      data = JSON.parse(body)
    } catch {
      return NextResponse.json({ ok: false }, { status: 400 })
    }

    // Strip any potentially sensitive fields before logging
    const { errorId, message, name, component, url, timestamp } = data

    // Log to stdout — captured by Docker / Vercel / log aggregators
    console.error(JSON.stringify({
      type: 'frontend_error',
      errorId: errorId || 'unknown',
      message: (typeof message === 'string' ? message : 'unknown').slice(0, 200),
      name: typeof name === 'string' ? name : 'Error',
      component: typeof component === 'string' ? component : 'unknown',
      url: typeof url === 'string' ? url : 'unknown',
      timestamp: timestamp || new Date().toISOString(),
    }))

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
