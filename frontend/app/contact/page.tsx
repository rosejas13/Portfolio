'use client'

import { useState, type FormEvent } from 'react'

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setStatus('idle')
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      })
      if (!res.ok) throw new Error('Failed')
      setStatus('success')
      setName('')
      setEmail('')
      setMessage('')
    } catch {
      setStatus('error')
      setError('Failed to send. Please try again.')
    }
  }

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 600, margin: '0 auto' }}>
        <h1>Contact</h1>
        <p style={{ color: '#666', marginBottom: 24 }}>Get in touch — I&apos;d love to hear from you.</p>
        {status === 'success' && <div className="success">Thanks! I&apos;ll get back to you soon.</div>}
        {status === 'error' && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Message</label>
            <textarea value={message} onChange={e => setMessage(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary">Send</button>
        </form>
      </div>
    </div>
  )
}
