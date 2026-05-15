import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// In-memory rate limiter (single-instance; for multi-instance use Redis)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function getClientIp(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown'
}

function checkRateLimit(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(key)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (entry.count >= maxRequests) return false

  entry.count++
  return true
}

// Periodic cleanup of expired entries (every 5 minutes)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of rateLimitMap) {
      if (now > entry.resetAt) rateLimitMap.delete(key)
    }
  }, 5 * 60 * 1000)
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const host = request.headers.get('host') || ''

  // Redirect .vercel.app domain to custom domain (disable public Vercel URL)
  if (host.includes('vercel.app')) {
    const url = request.nextUrl.clone()
    url.host = 'jcrose.dev'
    url.protocol = 'https'
    return NextResponse.redirect(url, 308)
  }

  const token = request.cookies.get('token')?.value
  const ip = getClientIp(request)

  // Rate limiting
  if (pathname === '/api/rpc/login_dev') {
    if (!checkRateLimit(`login:${ip}`, 10, 60_000)) {
      return NextResponse.json(
        { error: 'Too many login attempts' },
        { status: 429 }
      )
    }
  }

  if (pathname === '/api/leads' && request.method === 'POST') {
    if (!checkRateLimit(`leads:${ip}`, 5, 60_000)) {
      return NextResponse.json(
        { error: 'Too many messages' },
        { status: 429 }
      )
    }
  }

  // General rate limit
  if (pathname.startsWith('/api/')) {
    if (!checkRateLimit(`global:${ip}`, 100, 60_000)) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }
  }

  // Protect admin routes (except login page)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (!token) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin/login'
      return NextResponse.redirect(url)
    }
  }

  // For API proxy requests: inject JWT from cookie as Authorization header
  // (except auth routes which handle the cookie themselves)
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth/') && token) {
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('Authorization', `Bearer ${token}`)
    return NextResponse.next({
      request: { headers: requestHeaders },
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Exclude Next.js internals and static assets from middleware
    '/((?!_next|static|favicon.ico).*)',
  ],
}
