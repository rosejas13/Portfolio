'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
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
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: useSupabase ? { 'Content-Type': 'application/json' } : undefined,
        body: useSupabase ? JSON.stringify({ email, password }) : undefined,
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

  return (
    <div className="page">
      <div className={`container ${styles.loginWrap}`}>
        <h1>Admin Login</h1>
        <p className={styles.loginSubtitle}>Sign in to manage your portfolio.</p>
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit}>
          {useSupabase && (
            <>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
            </>
          )}
          <button type="submit" className="btn btn-primary w-full" disabled={submitting}>
            {submitting ? 'Signing in...' : useSupabase ? 'Sign in' : 'Sign in with Dev Account'}
          </button>
        </form>
      </div>
    </div>
  )
}
