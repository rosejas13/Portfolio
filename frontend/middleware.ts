import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

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

if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of rateLimitMap) {
      if (now > entry.resetAt) rateLimitMap.delete(key)
    }
  }, 5 * 60 * 1000)
}

const ADMIN_MUTATIONS = [
  '/api/projects',
  '/api/posts',
  '/api/skills',
  '/api/experiences',
  '/api/education',
  '/api/site_config',
  '/api/leads',
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const host = request.headers.get('host') || ''
  const ip = getClientIp(request)
  const token = request.cookies.get('token')?.value
  const hasSupabaseSession = request.cookies.getAll().some(c => c.name.startsWith('sb-'))

  // Redirect .vercel.app domain to custom domain
  if (host.includes('vercel.app')) {
    const url = request.nextUrl.clone()
    url.host = 'jcrose.dev'
    url.protocol = 'https'
    return NextResponse.redirect(url, 308)
  }

  // CSP nonce
  const nonce = crypto.randomUUID()
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)

  // Rate limiting
  if (pathname === '/api/rpc/login_dev') {
    if (!checkRateLimit(`login:${ip}`, 10, 60_000)) {
      return NextResponse.json({ error: 'Too many login attempts' }, { status: 429 })
    }
  }

  if (pathname === '/api/leads' && request.method === 'POST') {
    if (!checkRateLimit(`leads:${ip}`, 5, 60_000)) {
      return NextResponse.json({ error: 'Too many messages' }, { status: 429 })
    }
  }

  if (ADMIN_MUTATIONS.some(p => pathname.startsWith(p))) {
    if (request.method === 'POST' || request.method === 'PATCH' || request.method === 'DELETE') {
      if (!checkRateLimit(`admin:${ip}`, 30, 60_000)) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
      }
    }
  }

  if (pathname.startsWith('/api/')) {
    if (!checkRateLimit(`global:${ip}`, 100, 60_000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }
  }

  // Protect admin routes (check Supabase session OR custom JWT)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (!hasSupabaseSession && !token) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin/login'
      return NextResponse.redirect(url)
    }
  }

  // Inject auth token as Bearer for API proxy to PostgREST
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth/')) {
    const isProd = process.env.NODE_ENV === 'production'
    if (!isProd && token) {
      // Dev: use custom JWT from cookie
      requestHeaders.set('Authorization', `Bearer ${token}`)
    } else if (isProd && hasSupabaseSession) {
      // Production: extract access_token from Supabase session cookie
      const sbCookie = request.cookies.getAll().find(c => c.name.startsWith('sb-'))
      if (sbCookie) {
        try {
          // Handle chunked cookies: sb-*-auth-token, sb-*-auth-token-0, sb-*-auth-token-1...
          const prefix = sbCookie.name.replace(/-\d+$/, '')
          const chunks = request.cookies.getAll()
            .filter(c => c.name === prefix || c.name.startsWith(prefix + '-'))
            .sort((a, b) => a.name.localeCompare(b.name))
            .map(c => c.value)
          const combined = chunks.join('')
          const base64 = combined.replace(/-/g, '+').replace(/_/g, '/')
          const decoded = JSON.parse(atob(base64))
          const accessToken = decoded.access_token || decoded[0]?.access_token
          if (accessToken) {
            requestHeaders.set('Authorization', `Bearer ${accessToken}`)
          }
        } catch {
          // Cookie decode failed — skip auth header injection
        }
      }
    }
  }

  const response = NextResponse.next({ request: { headers: requestHeaders } })

  // Set CSP on pages (not API responses or Next.js internals)
  if (!pathname.startsWith('/api/') && !pathname.startsWith('/_next')) {
    response.headers.set(
      'Content-Security-Policy',
      [
        `default-src 'self'`,
        `script-src 'self' 'nonce-${nonce}'`,
        `style-src 'self' 'unsafe-inline'`,
        `img-src 'self' data:`,
        `font-src 'self'`,
        `connect-src 'self' https://fhantuyujrusrtrvctzw.supabase.co`,
      ].join('; ')
    )
  }

  return response
}

export const config = {
  matcher: ['/((?!_next|static|favicon.ico).*)'],
}
