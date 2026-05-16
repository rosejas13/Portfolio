'use client'

import { useState, type FormEvent } from 'react'
import { csrfToken } from '@/lib/api-client'
import styles from './contact.module.css'

function sanitize(input: string, maxLen: number): string {
  return input.trim().slice(0, maxLen)
}

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (submitting) return
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
        }),
      })
      if (!res.ok) {
        if (res.status === 429) throw new Error('Too many messages. Please try again later.')
        throw new Error('Failed to send. Please try again.')
      }
      setStatus('success')
      setName('')
      setEmail('')
      setMessage('')
    } catch (err: unknown) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Failed to send. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page">
      <div className="container">
        <div className={styles.pageWrap}>
          <h1>Contact</h1>
          <p className={styles.subtitle}>Get in touch — I&apos;d love to hear from you.</p>
          {status === 'success' && <div className="success">Thanks! I&apos;ll get back to you soon.</div>}
          {status === 'error' && <div className="error">{error}</div>}
          <form onSubmit={handleSubmit}>
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
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Sending...' : 'Send'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
