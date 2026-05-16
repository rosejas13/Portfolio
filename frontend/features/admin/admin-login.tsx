'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import styles from './admin.module.css'

export default function AdminLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const useSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const body = useSupabase ? JSON.stringify({ email, password }) : undefined
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
        body,
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Login failed')
      }
      router.push('/admin')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setSubmitting(false)
    }
  }

  async function handlePasskeySignIn() {
    if (!useSupabase) {
      setError('Supabase Auth is required for passkey sign-in.')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      const supabase = createClient()
      const { data, error: pkError } = await supabase.auth.signInWithPasskey()
      if (pkError) throw new Error(pkError.message)
      if (data) router.push('/admin')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Passkey sign-in failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page">
      <div className={`container ${styles.loginWrap}`}>
        <h1>Admin Login</h1>
        <p className={styles.loginSubtitle}>Sign in to manage your portfolio.</p>
        {error && (
          <div className="error" role="alert">
            {error}
            <button
              onClick={() => setError('')}
              style={{ float: 'right', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, fontSize: 16 }}
              aria-label="Dismiss"
            >
              &times;
            </button>
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary w-full" disabled={submitting}>
            {submitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        {useSupabase && (
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '16px 0' }} />
            <button
              type="button"
              className="btn btn-secondary w-full"
              onClick={handlePasskeySignIn}
              disabled={submitting}
            >
              Sign in with Passkey
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
