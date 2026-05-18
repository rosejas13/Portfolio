'use client'

import { useState, useEffect, useRef, type FormEvent } from 'react'
import { csrfToken } from '@/lib/api-client'
import Script from 'next/script'
import styles from './contact.module.css'

function sanitize(input: string, maxLen: number): string {
  return input.trim().slice(0, maxLen)
}

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [botField, setBotField] = useState('')
  const [turnstileToken, setTurnstileToken] = useState('')
  const turnstileRef = useRef<string | null>(null)

  useEffect(() => {
    const id = `ts-${Math.random().toString(36).slice(2)}`
    turnstileRef.current = id
    const onLoad = () => {
      if (window.turnstile && document.getElementById(id)) {
        window.turnstile.render(`#${id}`, {
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

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (submitting) return
    if (botField) { setStatus('success'); setName(''); setEmail(''); setMessage(''); return }
    if (!turnstileToken) { setStatus('error'); setError('Please complete the security check.'); return }
    setSubmitting(true)
    setStatus('idle')
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-Token': csrfToken(),
        },
        body: JSON.stringify({
          name: sanitize(name, 200),
          email: sanitize(email, 320),
          message: sanitize(message, 5000),
          turnstile: turnstileToken,
        }),
      })
      if (!res.ok) {
        if (res.status === 429) throw new Error('Too many messages. Please try again later.')
        const body = await res.json().catch(() => ({}))
        throw new Error((body as { error?: string }).error || 'Failed to send. Please try again.')
      }
      setStatus('success')
      setName('')
      setEmail('')
      setMessage('')
      setTurnstileToken('')
      if (window.turnstile && turnstileRef.current) window.turnstile.reset(`#${turnstileRef.current}`)
      fetch('/api/slack/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: sanitize(name, 200),
          email: sanitize(email, 320),
          message: sanitize(message, 5000),
        }),
      }).catch(() => {})
    } catch (err: unknown) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Failed to send. Please try again.')
      if (window.turnstile && turnstileRef.current) window.turnstile.reset(`#${turnstileRef.current}`)
    } finally {
      setSubmitting(false)
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
        <div className={styles.pageWrap}>
          <h1>Contact</h1>
          <p className={styles.subtitle}>Get in touch — I&apos;d love to hear from you.</p>
          {status === 'success' && <div className="success">Thanks! I&apos;ll get back to you soon.</div>}
          {status === 'error' && <div className="error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div style={{ position: 'absolute', left: '-9999px', opacity: 0 }} aria-hidden="true">
              <label>Leave this empty</label>
              <input tabIndex={-1} autoComplete="off" value={botField} onChange={e => setBotField(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Name</label>
              <input value={name} onChange={e => setName(e.target.value)} required maxLength={200} />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required maxLength={320} />
            </div>
            <div className="form-group">
              <label>Message</label>
              <textarea value={message} onChange={e => setMessage(e.target.value)} required maxLength={5000} />
            </div>
            <div id={turnstileRef.current || 'turnstile'} style={{ marginBottom: '1rem' }} />
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Sending...' : 'Send'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
