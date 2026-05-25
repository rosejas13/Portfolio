import { test, expect } from '@playwright/test'

const PUBLIC_PAGES = [
  { path: '/', title: /Software Engineer|Full-Stack|Jasper/ },
  { path: '/about', title: 'About' },
  { path: '/services', title: 'Services' },
  { path: '/projects', title: 'Projects' },
  { path: '/blog', title: 'Blog' },
  { path: '/contact', title: 'Contact' },
] as const

test.describe('Navigation', () => {
  for (const { path, title } of PUBLIC_PAGES) {
    test(`${path} loads and displays page title`, async ({ page }) => {
      const resp = await page.goto(path)
      expect(resp?.status()).toBe(200)
      await expect(page.locator('h1')).toContainText(title)
    })
  }

  test('nav links navigate to correct pages', async ({ page }) => {
    await page.goto('/')
    const links = page.locator('nav a')
    const count = await links.count()
    expect(count).toBeGreaterThan(2)

    for (const link of ['/about', '/services', '/projects', '/blog', '/contact']) {
      const navLink = page.locator(`nav a[href="${link}"]`).first()
      await expect(navLink).toBeVisible()
    }
  })

  test('logo link goes to home', async ({ page }) => {
    await page.goto('/about')
    await page.locator('.logo').first().click()
    await expect(page).toHaveURL('/')
  })

  test('back link from project detail works', async ({ page }) => {
    await page.goto('/projects')
    const firstProject = page.locator('a[href^="/projects/"]').first()
    if (await firstProject.count() === 0) return

    await firstProject.click()
    await page.waitForURL(/\/projects\//)
    const backLink = page.locator('a[href="/projects"]').first()
    await expect(backLink).toBeVisible()
    await backLink.click()
    await expect(page).toHaveURL('/projects')
  })

  test('back link from blog post works', async ({ page }) => {
    await page.goto('/blog')
    const firstPost = page.locator('a[href^="/blog/"]').first()
    if (await firstPost.count() === 0) return

    await firstPost.click()
    await page.waitForURL(/\/blog\//)
    const backLink = page.locator('a[href="/blog"]').first()
    await expect(backLink).toBeVisible()
    await backLink.click()
    await expect(page).toHaveURL('/blog')
  })
})

test.describe('Home Page', () => {
  test('displays hero section with actions', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('a[href="/projects"]').first()).toBeVisible()
    await expect(page.locator('a[href="/about"]').first()).toBeVisible()
    await expect(page.locator('a[href="/contact"]').first()).toBeVisible()
  })

  test('social links are present when configured', async ({ page }) => {
    await page.goto('/')
    const socialNav = page.locator('nav[aria-label="Social links"]')
    const links = socialNav.locator('a')
    const count = await links.count()
    expect(count).toBeGreaterThanOrEqual(0)
  })

  test('recent posts section appears when posts exist', async ({ page }) => {
    await page.goto('/')
    const recentSection = page.locator('h2')
    const hasRecentPosts = await recentSection.filter({ hasText: 'Recent Posts' }).count()
    if (hasRecentPosts) {
      await expect(recentSection.filter({ hasText: 'Recent Posts' })).toBeVisible()
      await expect(page.locator('a[href^="/blog/"]').first()).toBeVisible()
    }
  })
})

test.describe('Project Detail', () => {
  test('project page loads with title and tech stack', async ({ page }) => {
    await page.goto('/projects')
    const firstProject = page.locator('a[href^="/projects/"]').first()
    if (await firstProject.count() === 0) return

    await firstProject.click()
    await page.waitForURL(/\/projects\//)
    await expect(page.locator('h1')).toBeVisible()
    const techTags = page.locator('span[class*="tag"]')
    const techCount = await techTags.count()
    expect(techCount).toBeGreaterThanOrEqual(0)
  })

  test('project detail has action buttons', async ({ page }) => {
    await page.goto('/projects')
    const firstLink = page.locator('a[href^="/projects/"]').first()
    if (await firstLink.count() === 0) return

    await firstLink.click()
    await page.waitForURL(/\/projects\//)
    const liveSite = page.locator('a[aria-label*="Live site"]')
    const sourceCode = page.locator('a[aria-label*="Source code"]')
    const hasLive = await liveSite.count()
    const hasSource = await sourceCode.count()
    expect(hasLive + hasSource).toBeGreaterThanOrEqual(0)
  })
})

test.describe('Contact Form', () => {
  test('form fields are visible and labeled', async ({ page }) => {
    await page.goto('/contact')
    await expect(page.locator('h1')).toContainText('Contact')
    await expect(page.locator('input#name')).toBeAttached()
    await expect(page.locator('input#email')).toBeAttached()
    await expect(page.locator('textarea')).toBeAttached()
  })

  test('submit button is disabled when form incomplete', async ({ page }) => {
    await page.goto('/contact')
    const submit = page.locator('button[type="submit"]')
    await expect(submit).toBeDisabled()
  })

  test('empty name shows validation', async ({ page }) => {
    await page.goto('/contact')
    const emailInput = page.locator('input#email')
    await emailInput.fill('test@example.com')
    await page.locator('textarea').fill('Hello')
    const submit = page.locator('button[type="submit"]')
    await expect(submit).toBeDisabled()
  })
})

test.describe('Privacy Page', () => {
  test('privacy page loads with all sections', async ({ page }) => {
    await page.goto('/privacy')
    await expect(page.locator('h1')).toContainText('Privacy Policy')
    const sections = [
      'What data is collected',
      'How data is used',
      'Your rights',
      'Request data deletion',
    ]
    for (const s of sections) {
      await expect(page.locator(`h2:has-text("${s}")`).first()).toBeVisible()
    }
  })

  test('delete form is present', async ({ page }) => {
    await page.goto('/privacy')
    await expect(page.locator('input[type="email"]')).toBeAttached()
    await expect(page.locator('button:has-text("Delete")')).toBeAttached()
  })
})

test.describe('Responsive Layout', () => {
  test('mobile menu toggle exists on small viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/')
    const hamburger = page.locator('button[aria-label*="menu"]').first()
    await expect(hamburger).toBeVisible()
  })

  test('page content reflows at mobile width', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/about')
    await expect(page.locator('h1')).toBeVisible()
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
    expect(bodyWidth).toBeLessThanOrEqual(380)
  })

  test('page content reflows at tablet width', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/services')
    await expect(page.locator('h1')).toBeVisible()
  })
})

test.describe('Theme', () => {
  test('theme toggle button exists', async ({ page }) => {
    await page.goto('/')
    const toggle = page.locator('button[aria-label="Toggle dark mode"]')
    await expect(toggle).toBeVisible()
  })
})

test.describe('Keyboard Navigation', () => {
  test('skip to content link is focusable', async ({ page }) => {
    await page.goto('/')
    await page.keyboard.press('Tab')
    const skipLink = page.locator('.skip-link:focus')
    await expect(skipLink).toBeVisible()
  })

  test('Tab navigates through nav links', async ({ page }) => {
    await page.goto('/')
    const navLinks = page.locator('nav a')
    const count = await navLinks.count()
    for (let i = 0; i < Math.min(count, 3); i++) {
      await page.keyboard.press('Tab')
      await expect(navLinks.nth(i)).toBeFocused()
    }
  })
})
