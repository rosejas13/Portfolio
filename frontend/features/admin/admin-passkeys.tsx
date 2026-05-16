'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import styles from './admin.module.css'

export default function AdminPasskeys() {
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [registering, setRegistering] = useState(false)
  const [passkeys, setPasskeys] = useState<{ id: string; created_at: string }[]>([])

  async function handleRegister() {
    setMessage(null)
    setRegistering(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.registerPasskey()
      if (error) throw new Error(error.message)
      setMessage({ type: 'success', text: 'Passkey registered successfully!' })
      if (data?.id) {
        setPasskeys(prev => [...prev, { id: data.id, created_at: new Date().toISOString() }])
      }
    } catch (err: unknown) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to register passkey' })
    } finally {
      setRegistering(false)
    }
  }

  return (
    <div>
      <h1>Passkeys</h1>
      <p style={{ color: '#666', marginBottom: 24 }}>
        Register a passkey to sign in without a password using your device&apos;s biometrics or PIN.
      </p>

      {message && (
        <div className={message.type === 'success' ? 'success' : 'error'}>{message.text}</div>
      )}

      <button
        className="btn btn-primary"
        onClick={handleRegister}
        disabled={registering}
      >
        {registering ? 'Registering...' : 'Register New Passkey'}
      </button>

      {passkeys.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h2>Registered Passkeys</h2>
          <table className={styles.tableWrap}>
            <thead><tr><th>ID</th><th>Registered</th></tr></thead>
            <tbody>
              {passkeys.map(pk => (
                <tr key={pk.id}>
                  <td className="mono fs-12">{pk.id.slice(0, 20)}...</td>
                  <td>{new Date(pk.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
