'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    try {
      const res = await fetch('/api/rpc/login_dev', { method: 'POST' })
      const text = await res.text()
      const token = JSON.parse(text)
      if (typeof token !== 'string') throw new Error('Invalid response')
      localStorage.setItem('token', token)
      router.push('/admin')
    } catch {
      setError('Login failed. Make sure the backend is running and dev mode is enabled.')
    }
  }

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 400, margin: '60px auto' }}>
        <h1>Admin Login</h1>
        <p style={{ color: '#666', marginBottom: 20 }}>Sign in to manage your portfolio.</p>
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            Sign in with Dev Account
          </button>
        </form>
      </div>
    </div>
  )
}
