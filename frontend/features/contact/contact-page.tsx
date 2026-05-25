'use client'

import { Alert, Button, Input, Text, TextArea } from 'azimuth-ui'
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
  const turnstileId = useRef(`contact-ts-${Math.random().toString(36).slice(2)}`).current

  useEffect(() => {
    const onTurnstileLoad = () => {
      if (window.turnstile && document.getElementById(turnstileId)) {
        if (!document.getElementById(turnstileId)?.querySelector('iframe')) {
          window.turnstile.render(`#${turnstileId}`, {
            sitekey: TURNSTILE_SITE_KEY,
            callback: (token: string) => setTurnstileToken(token),
            'expired-callback': () => setTurnstileToken(''),
            theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
          })
        }
      }
    }
    if (window.turnstile) {
      onTurnstileLoad()
    } else {
      window.onloadTurnstile = onTurnstileLoad
      return () => {
        delete window.onloadTurnstile
      }
    }
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (submitting) return
    if (botField) {
      setStatus('success')
      setName('')
      setEmail('')
      setMessage('')
      return
    }
    if (!turnstileToken) {
      setStatus('error')
      setError('Please complete the security check.')
      return
    }
    setSubmitting(true)
    setStatus('idle')
    try {
      const sanitizedName = sanitize(name, 200)
      const sanitizedEmail = sanitize(email, 320)
      const sanitizedMessage = sanitize(message, 5000)
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-Token': csrfToken(),
        },
        body: JSON.stringify({
          name: sanitizedName,
          email: sanitizedEmail,
          message: sanitizedMessage,
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
      if (window.turnstile) window.turnstile.reset(`#${turnstileId}`)
      fetch('/api/slack/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: sanitizedName,
          email: sanitizedEmail,
          message: sanitizedMessage,
        }),
      }).catch(() => {})
    } catch (err: unknown) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Failed to send. Please try again.')
      if (window.turnstile) window.turnstile.reset(`#${turnstileId}`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page">
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstile"
        strategy="afterInteractive"
      />
      <div className="container">
        <div className={styles.pageWrap}>
          <Text as="h1" size="h1" weight="bold">
            Contact
          </Text>
          <Text size="lg" color="secondary" className={styles.subtitle}>
            Get in touch — I&apos;d love to hear from you.
          </Text>
          {status === 'success' && (
            <Alert variant="success">Thanks! I&apos;ll get back to you soon.</Alert>
          )}
          {status === 'error' && (
            <Alert variant="alert" id="contact-error" role="alert">
              {error}
            </Alert>
          )}
          <form onSubmit={handleSubmit}>
            <div style={{ position: 'absolute', left: '-9999px', opacity: 0 }} aria-hidden="true">
              <label htmlFor="contact-bot">Leave this empty</label>
              <input
                id="contact-bot"
                tabIndex={-1}
                autoComplete="off"
                value={botField}
                onChange={(e) => setBotField(e.target.value)}
              />
            </div>
            <Input
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={200}
              autoComplete="name"
              aria-describedby="contact-error"
            />
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              maxLength={320}
              autoComplete="email"
              aria-describedby="contact-error"
            />
            <TextArea
              label="Message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              maxLength={5000}
              aria-describedby="contact-error"
            />
            <div
              id={turnstileId}
              style={{ marginBlock: '1rem' }}
            />
            <Button
              type="submit"
              variant="primary"
              disabled={
                submitting || !name.trim() || !email.trim() || !message.trim() || !turnstileToken
              }
            >
              {submitting ? 'Sending...' : 'Send'}
            </Button>
            <Text size="xs" color="muted" style={{ marginTop: '0.5rem' }}>
              Your name, email, and message are stored in the database and forwarded to a private Slack
              channel so I can respond. See the{' '}
              <a href="/privacy" style={{ textDecoration: 'underline' }}>privacy policy</a>.
            </Text>
          </form>
        </div>
      </div>
    </div>
  )
}
