'use client'

import { useState, useEffect, useRef, type FormEvent } from 'react'
import Script from 'next/script'

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'

export default function PrivacyPage() {
  const [delEmail, setDelEmail] = useState('')
  const [delStatus, setDelStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [delMsg, setDelMsg] = useState('')
  const [delSubmitting, setDelSubmitting] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState('')
  const turnstileId = useRef(`del-ts-${Math.random().toString(36).slice(2)}`).current

  useEffect(() => {
    const onLoad = () => {
      const el = document.getElementById(turnstileId)
      if (window.turnstile && el) {
        window.turnstile.render(`#${turnstileId}`, {
          sitekey: TURNSTILE_SITE_KEY,
          callback: (token: string) => setTurnstileToken(token),
          'expired-callback': () => setTurnstileToken(''),
          theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
        })
      }
    }
    if (window.turnstile) {
      onLoad()
    } else {
      window.addEventListener('load-turnstile', onLoad as EventListener)
      return () => window.removeEventListener('load-turnstile', onLoad as EventListener)
    }
  }, [])

  async function handleDelete(e: FormEvent) {
    e.preventDefault()
    if (delSubmitting) return
    if (!turnstileToken) { setDelStatus('error'); setDelMsg('Please complete the security check.'); return }
    setDelSubmitting(true)
    setDelStatus('idle')
    try {
      const res = await fetch('/api/leads/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: delEmail, turnstile: turnstileToken }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error((data as { error?: string }).error || 'Failed')
      setDelStatus('success')
      setDelMsg((data as { message?: string }).message || 'Deletion processed.')
      setDelEmail('')
      setTurnstileToken('')
      if (window.turnstile) window.turnstile.reset(`#${turnstileId}`)
    } catch (err: unknown) {
      setDelStatus('error')
      setDelMsg(err instanceof Error ? err.message : 'Failed')
    } finally {
      setDelSubmitting(false)
    }
  }

  return (
    <div className="page">
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstile"
        strategy="afterInteractive"
        onLoad={() => window.dispatchEvent(new Event('load-turnstile'))}
      />
      <div className="container">
        <h1>Privacy Policy</h1>
        <p>This is a personal portfolio site. I do not sell, share, or monetize your data. No analytics, no tracking cookies, no advertising.</p>

        <h2>What data is collected</h2>
        <p>The contact form collects your name, email address, and message. Submitting the form is voluntary — you choose what to share.</p>

        <h2>Legal basis (GDPR)</h2>
        <p>Processing is based on legitimate interest: you are contacting me, and I need your email to respond. No automated decisions or profiling take place.</p>

        <h2>How data is used</h2>
        <p>Your contact information is used solely to respond to your inquiry. It is never sold, shared with third parties for marketing, or used for any purpose beyond our conversation.</p>

        <h2>Data storage</h2>
        <p>Contact form submissions are stored in a Supabase database hosted in the United States. Supabase acts as a data processor and does not access your data for its own purposes.</p>

        <h2>Retention</h2>
        <p>Contact form data is retained indefinitely unless you request deletion. I keep it to maintain context for ongoing conversations and professional relationships.</p>

        <h2>Your rights</h2>
        <p>Under GDPR (EU/UK residents) and CCPA (California residents), you have the right to:</p>
        <ul>
          <li>Know what personal data I hold about you</li>
          <li>Request correction of inaccurate data</li>
          <li>Request deletion of your data — including from the database and from Slack</li>
          <li>Receive a copy of your data</li>
          <li>Withdraw consent where processing is based on consent</li>
        </ul>
        <p>To exercise these rights, email me at the address on the Contact page. I will respond within 30 days as required by law.</p>

        <h2>CCPA notice</h2>
        <p>I do not sell personal information. I do not use your data for targeted advertising. I collect only the categories of information you voluntarily provide (name, email, message content).</p>

        <h2>Third-party services</h2>
        <p>This site uses the following services that may process your data:</p>
        <ul>
          <li><strong>Vercel</strong> — hosting. May process IP addresses and request metadata.</li>
          <li><strong>Supabase</strong> — database. Stores contact form submissions.</li>
          <li><strong>Cloudflare</strong> — DNS, security, and bot protection (Turnstile). Processes IP addresses and security challenge data. Turnstile does not track you across sites.</li>
          <li><strong>Slack</strong> — when you submit the contact form, your name, email, and message are forwarded to a private Slack channel so I can respond quickly. The message persists in Slack unless deleted.</li>
        </ul>
        <p>None of these services receive your data for their own marketing or advertising purposes.</p>

        <h2>Children&apos;s privacy</h2>
        <p>This site is not directed at children under 13, and I do not knowingly collect data from them.</p>

        <h2>International transfers</h2>
        <p>Data is stored in the United States. By using the contact form, you consent to this transfer. Supabase and Vercel maintain Standard Contractual Clauses for EU data transfers.</p>

        <h2>Request data deletion</h2>
        <p>Enter the email address you used on the contact form to delete all associated records:</p>
        {delStatus === 'success' && <div className="success" role="status">{delMsg}</div>}
        {delStatus === 'error' && <div className="error" role="status" id="del-error">{delMsg}</div>}
        <form onSubmit={handleDelete} style={{ marginTop: '1rem' }}>
          <div className="form-group">
            <label htmlFor="del-email">Email address to delete</label>
            <input
              id="del-email"
              type="email"
              value={delEmail}
              onChange={e => setDelEmail(e.target.value)}
              required
              autoComplete="email"
              aria-describedby="del-error"
              placeholder="you@example.com"
            />
          </div>
          <div id={turnstileId} style={{ marginBottom: '1rem' }} aria-label="Security verification" />
          <button type="submit" className="btn btn-secondary" disabled={delSubmitting}>
            {delSubmitting ? 'Deleting...' : 'Delete my data'}
          </button>
        </form>

        <h2>Changes</h2>
        <p>If this policy changes, I&apos;ll update this page.</p>

        <p style={{ marginTop: '3rem', color: 'var(--color-text-muted)', fontSize: 'var(--fs-sm)' }}>
          Last updated: May 2026 &middot; Questions? Use the contact form.
        </p>
      </div>
    </div>
  )
}
