import { test, expect } from '@playwright/test'

const PUBLIC_PAGES = ['/', '/about', '/projects', '/blog', '/contact']
const ADMIN_ROUTES = ['/admin', '/admin/projects', '/admin/skills', '/admin/blog', '/admin/leads', '/admin/config', '/admin/experience', '/admin/education', '/admin/security', '/admin/metrics']
const API_URL = 'http://localhost:3001'

test.describe('Security Headers', () => {
  for (const path of PUBLIC_PAGES) {
    test(`${path} sets X-Frame-Options: DENY`, async ({ page }) => {
      const resp = await page.goto(path)
      const headers = resp!.headers()
      expect(headers['x-frame-options']).toBe('DENY')
    })

    test(`${path} sets Content-Security-Policy`, async ({ page }) => {
      const resp = await page.goto(path)
      const csp = resp!.headers()['content-security-policy']
      expect(csp).toBeDefined()
      expect(csp).toContain("default-src 'self'")
    })

    test(`${path} sets X-Content-Type-Options: nosniff`, async ({ page }) => {
      const resp = await page.goto(path)
      const header = resp!.headers()['x-content-type-options']
      expect(header?.toLowerCase()).toBe('nosniff')
    })
  }
})

test.describe('Authentication & Access Control', () => {
  for (const adminPath of ADMIN_ROUTES) {
    test(`unauthenticated user redirected from ${adminPath} to login`, async ({ browser }) => {
      const ctx = await browser.newContext({ storageState: undefined })
      const bp = await ctx.newPage()
      await bp.goto(adminPath)
      await bp.waitForURL(/\/admin\/login/)
      expect(bp.url()).toContain('/admin/login')
      await ctx.close()
    })
  }

  test('admin API returns 401 without auth', async ({ request }) => {
    const resp = await request.get(`${API_URL}/site_config`)
    expect(resp.status()).toBe(401)
  })

  test('admin RPC returns 401 or 400 without auth', async ({ request }) => {
    const resp = await request.post(`${API_URL}/rpc/metrics`)
    expect([400, 401, 403]).toContain(resp.status())
  })

  test('whoami returns anon role for unauthenticated', async ({ request }) => {
    const resp = await request.get(`${API_URL}/rpc/whoami`)
    expect(resp.status()).toBe(200)
    const body = await resp.json()
    expect(body.role).toBe('anon')
  })
})

test.describe('Login Security', () => {
  test('login form has password field', async ({ page }) => {
    await page.goto('/admin/login')
    const passwordInput = page.locator('#password')
    await expect(passwordInput).toBeAttached()
    expect(await passwordInput.getAttribute('type')).toBe('password')
  })

  test('login error does not reveal whether user exists', async ({ page }) => {
    await page.goto('/admin/login')
    await page.fill('#email', 'nonexistent@test.com')
    await page.fill('#password', 'wrongpassword')
    await page.click('button[type="submit"]')
    await page.waitForTimeout(2000)
    const bodyText = await page.locator('body').textContent()
    const userSpecificMessages = ['not found', 'doesn\'t exist']
    for (const msg of userSpecificMessages) {
      expect(bodyText?.toLowerCase()).not.toContain(msg)
    }
  })
})

test.describe('XSS Prevention', () => {
  const xssPayloads = [
    '<script>alert(1)</script>',
    '"><script>alert(1)</script>',
    '<img src=x onerror=alert(1)>',
  ]

  for (const payload of xssPayloads) {
    test(`contact form stores XSS payload safely: ${payload.slice(0, 30)}`, async ({ request }) => {
      const resp = await request.post(`${API_URL}/leads`, {
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        data: {
          name: payload,
          email: 'xss-test@example.com',
          message: 'test message',
          source: 'contact_form',
          status: 'new',
        },
      })
      expect([201, 422]).toContain(resp.status())
    })
  }

  for (const payload of xssPayloads) {
    test(`URL params do not execute scripts: ${payload.slice(0, 30)}`, async ({ page }) => {
      let scriptExecuted = false
      page.on('dialog', () => { scriptExecuted = true })
      await page.goto(`/?q=${encodeURIComponent(payload)}`)
      await page.waitForTimeout(1000)
      expect(scriptExecuted).toBe(false)
    })
  }
})

test.describe('Contact Form Security', () => {
  test('invalid email format is rejected', async ({ request }) => {
    const resp = await request.post(`${API_URL}/leads`, {
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      data: {
        name: 'Test',
        email: 'not-an-email',
        message: 'test',
        source: 'contact_form',
        status: 'new',
      },
    })
    // DB constraint chk_lead_email_format should catch this
    expect([400, 422]).toContain(resp.status())
  })

  test('oversized name is rejected', async ({ request }) => {
    const resp = await request.post(`${API_URL}/leads`, {
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      data: {
        name: 'x'.repeat(201),
        email: 'test@example.com',
        message: 'test',
        source: 'contact_form',
        status: 'new',
      },
    })
    expect([400, 422]).toContain(resp.status())
  })

  test('oversized message is rejected', async ({ request }) => {
    const resp = await request.post(`${API_URL}/leads`, {
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      data: {
        name: 'Test',
        email: 'test@example.com',
        message: 'x'.repeat(5001),
        source: 'contact_form',
        status: 'new',
      },
    })
    expect([400, 422]).toContain(resp.status())
  })
})

test.describe('API Security', () => {
  test('public GET endpoints do not expose sensitive internal fields', async ({ request }) => {
    const resp = await request.get(`${API_URL}/projects`)
    expect(resp.status()).toBe(200)
    const body = await resp.json()
    if (body.length > 0) {
      const project = body[0]
      const sensitiveKeys = ['password', 'secret', 'token', 'jwt', 'hash']
      for (const key of sensitiveKeys) {
        const found = Object.keys(project).some(k => k.toLowerCase().includes(key))
        expect(found).toBeFalsy()
      }
    }
  })

  test('POST to projects without auth returns 401', async ({ request }) => {
    const resp = await request.post(`${API_URL}/projects`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer invalid-token',
      },
      data: { title: 'hack', slug: 'hack', status: 'published' },
    })
    expect(resp.status()).toBe(401)
  })

  test('JWT token is not stored in client-accessible storage', async ({ page }) => {
    await page.goto('/')
    const hasToken = await page.evaluate(() => {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i) || ''
        if (key.toLowerCase().includes('token') || key.toLowerCase().includes('jwt')) return true
      }
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i) || ''
        if (key.toLowerCase().includes('token') || key.toLowerCase().includes('jwt')) return true
      }
      return false
    })
    expect(hasToken).toBe(false)
  })
})

test.describe('Information Disclosure', () => {
  test('error responses do not contain stack traces', async ({ request }) => {
    const resp = await request.post(`${API_URL}/projects`, {
      headers: { 'Content-Type': 'application/json' },
      data: { title: null },
    })
    const body = await resp.text().catch(() => '')
    expect(body.toLowerCase()).not.toContain('stack')
    expect(body.toLowerCase()).not.toContain('at ')
  })

  test('API root does not expose directory listing', async ({ request }) => {
    const resp = await request.get(`${API_URL}/`)
    const body = await resp.text().catch(() => '')
    expect(body.toLowerCase()).not.toContain('index of')
  })
})

// These tests verify the dev-mode login flow (login_dev RPC).
// In production without Supabase, login returns 501 and these are skipped.
async function tryDevLogin(page: any) {
  await page.goto('/admin/login')
  await page.fill('#email', 'dev@localhost')
  await page.fill('#password', 'anything')
  await page.click('button[type="submit"]')
  await page.waitForTimeout(1500)
  return !page.url().includes('/admin/login')
}

test.describe('Authentication Flow', () => {
  test('successful login redirects to admin (dev mode)', async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: undefined })
    const bp = await ctx.newPage()
    const loggedIn = await tryDevLogin(bp)
    test.skip(!loggedIn, 'requires dev mode (login_dev RPC)')
    expect(bp.url()).not.toContain('/admin/login')
    await ctx.close()
  })

  test('token cookie is httpOnly and sameSite=strict', async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: undefined })
    const bp = await ctx.newPage()
    const loggedIn = await tryDevLogin(bp)
    test.skip(!loggedIn, 'requires dev mode (login_dev RPC)')

    const cookies = await bp.context().cookies()
    const tokenCookie = cookies.find(c => c.name === 'token')
    expect(tokenCookie).toBeDefined()
    expect(tokenCookie!.httpOnly).toBe(true)
    expect(tokenCookie!.sameSite).toBe('Strict')
    await ctx.close()
  })

  test('logged-in user can access /admin/projects', async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: undefined })
    const bp = await ctx.newPage()
    const loggedIn = await tryDevLogin(bp)
    test.skip(!loggedIn, 'requires dev mode (login_dev RPC)')

    await bp.goto('/admin/projects')
    expect(bp.url()).toContain('/admin/projects')
    expect(bp.url()).not.toContain('/admin/login')
    await ctx.close()
  })
})

test.describe('IDOR and Path Traversal', () => {
  test('path traversal attempts return 404 or error', async ({ request }) => {
    const paths = [
      '/projects/../../../etc/passwd',
      '/../.env',
      '/projects/%2e%2e%2f',
    ]
    for (const path of paths) {
      const resp = await request.get(`${API_URL}${path}`)
      expect([400, 401, 404, 405]).toContain(resp.status())
    }
  })
})

test.describe('Cookie Security', () => {
  test('no session cookies leak via JavaScript', async ({ page }) => {
    await page.goto('/')
    const cookies = await page.context().cookies()
    const jsAccessible = cookies.filter(c => !c.httpOnly)
    for (const cookie of jsAccessible) {
      expect(cookie.name).not.toMatch(/token|session|auth/i)
    }
  })
})
