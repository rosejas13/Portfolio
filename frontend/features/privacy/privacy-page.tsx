'use client'

import { Alert, Button, Input, Text } from 'azimuth-ui'
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
    const onTurnstileLoad = () => {
      const el = document.getElementById(turnstileId)
      if (window.turnstile && el && !el.querySelector('iframe')) {
        window.turnstile.render(`#${turnstileId}`, {
          sitekey: TURNSTILE_SITE_KEY,
          callback: (token: string) => setTurnstileToken(token),
          'expired-callback': () => setTurnstileToken(''),
          theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
        })
      }
    }
    if (window.turnstile) {
      onTurnstileLoad()
    } else {
      window.onloadTurnstile = onTurnstileLoad
      return () => { delete window.onloadTurnstile }
    }
  }, [])

  async function handleDelete(e: FormEvent) {
    e.preventDefault()
    if (delSubmitting) return
    if (!turnstileToken) {
      setDelStatus('error')
      setDelMsg('Please complete the security check.')
      return
    }
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
      />
      <div className="container">
        <Text as="h1" size="h1" weight="bold">Privacy Policy</Text>
        <Text>This is a personal portfolio site. I do not sell, share, or monetize your data. No analytics, no tracking cookies, no advertising.</Text>

        <Text as="h2" size="h2" weight="bold">What data is collected</Text>
        <Text>The contact form collects your name, email address, and message. Submitting the form is voluntary — you choose what to share.</Text>

        <Text as="h2" size="h2" weight="bold">Legal basis (GDPR)</Text>
        <Text>Processing is based on legitimate interest: you are contacting me, and I need your email to respond. No automated decisions or profiling take place.</Text>

        <Text as="h2" size="h2" weight="bold">How data is used</Text>
        <Text>Your contact information is used solely to respond to your inquiry. It is never sold, shared with third parties for marketing, or used for any purpose beyond our conversation.</Text>

        <Text as="h2" size="h2" weight="bold">Data storage</Text>
        <Text>Contact form submissions are stored in a Supabase database hosted in the United States. Supabase acts as a data processor and does not access your data for its own purposes.</Text>

        <Text as="h2" size="h2" weight="bold">Retention</Text>
        <Text>Contact form data is retained indefinitely unless you request deletion. I keep it to maintain context for ongoing conversations and professional relationships.</Text>

        <Text as="h2" size="h2" weight="bold">Your rights</Text>
        <Text>Under GDPR (EU/UK residents) and CCPA (California residents), you have the right to:</Text>
        <ul>
          <li>Know what personal data I hold about you</li>
          <li>Request correction of inaccurate data</li>
          <li>Request deletion of your data — including from the database and from Slack</li>
          <li>Receive a copy of your data</li>
          <li>Withdraw consent where processing is based on consent</li>
        </ul>
        <Text>To exercise these rights, email me at the address on the Contact page. I will respond within 30 days as required by law.</Text>

        <Text as="h2" size="h2" weight="bold">CCPA notice</Text>
        <Text>I do not sell personal information. I do not use your data for targeted advertising. I collect only the categories of information you voluntarily provide (name, email, message content).</Text>

        <Text as="h2" size="h2" weight="bold">Third-party services</Text>
        <Text>This site uses the following services that may process your data:</Text>
        <ul>
          <li><strong>Vercel</strong> — hosting. May process IP addresses and request metadata.</li>
          <li><strong>Supabase</strong> — database. Stores contact form submissions.</li>
          <li><strong>Cloudflare</strong> — DNS, security, and bot protection (Turnstile). Processes IP addresses and security challenge data. Turnstile does not track you across sites.</li>
          <li><strong>Slack</strong> — when you submit the contact form, your name, email, and message are forwarded to a private Slack channel so I can respond quickly. The message persists in Slack unless deleted.</li>
        </ul>
        <Text>None of these services receive your data for their own marketing or advertising purposes.</Text>

        <Text as="h2" size="h2" weight="bold">Children&apos;s privacy</Text>
        <Text>This site is not directed at children under 13, and I do not knowingly collect data from them.</Text>

        <Text as="h2" size="h2" weight="bold">International transfers</Text>
        <Text>Data is stored in the United States. By using the contact form, you consent to this transfer. Supabase and Vercel maintain Standard Contractual Clauses for EU data transfers.</Text>

        <Text as="h2" size="h2" weight="bold">Request data deletion</Text>
        <Text>Enter the email address you used on the contact form to delete all associated records:</Text>
        {delStatus === 'success' && <Alert variant="success">{delMsg}</Alert>}
        {delStatus === 'error' && <Alert variant="alert" id="del-error">{delMsg}</Alert>}
        <form onSubmit={handleDelete} style={{ marginTop: '1rem' }}>
          <Input label="Email address to delete" type="email" value={delEmail} onChange={(e) => setDelEmail(e.target.value)} required autoComplete="email" aria-describedby="del-error" placeholder="you@example.com" />
          <div id={turnstileId} style={{ marginBlock: '1rem' }} />
          <Button type="submit" variant="secondary" disabled={delSubmitting}>{delSubmitting ? 'Deleting...' : 'Delete my data'}</Button>
        </form>

        <Text as="h2" size="h2" weight="bold">Changes</Text>
        <Text>If this policy changes, I&apos;ll update this page.</Text>

        <Text size="sm" color="muted" style={{ marginTop: '3rem' }}>Last updated: May 2026 &middot; Questions? Use the contact form.</Text>
      </div>
    </div>
  )
}
