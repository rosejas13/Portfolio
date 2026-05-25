'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import styles from './admin.module.css'

export default function AdminPasskeys() {
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [loading, setLoading] = useState(false)

  // TOTP enrollment state
  const [enrolling, setEnrolling] = useState(false)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [secret, setSecret] = useState<string | null>(null)
  const [factorId, setFactorId] = useState<string | null>(null)
  const [verifyCode, setVerifyCode] = useState('')

  // Existing factors
  const [factors, setFactors] = useState<{ id: string; type: string; verified: boolean }[]>([])

  useEffect(() => {
    loadFactors()
  }, [])

  async function loadFactors() {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.mfa.listFactors()
      if (error) throw error
      if (data) {
        setFactors(
          data.all.map(f => ({
            id: f.id,
            type: f.factor_type,
            verified: f.status === 'verified',
          }))
        )
      }
    } catch {
      // Not logged in or MFA not available
    }
  }

  async function handleEnroll() {
    setMessage(null)
    setEnrolling(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' })
      if (error) throw new Error(error.message)
      if (!data) throw new Error('No enrollment data returned')

      setQrCode(data.totp.qr_code)
      setSecret(data.totp.secret)
      setFactorId(data.id)
      setVerifyCode('')
    } catch (err: unknown) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to start enrollment' })
      setEnrolling(false)
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    if (!factorId) return
    setMessage(null)
    setLoading(true)
    try {
      const supabase = createClient()
      const challenge = await supabase.auth.mfa.challenge({ factorId })
      if (challenge.error) throw new Error(challenge.error.message)

      const verify = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.data.id,
        code: verifyCode,
      })
      if (verify.error) throw new Error(verify.error.message)

      setMessage({ type: 'success', text: 'Authenticator app configured successfully!' })
      setQrCode(null)
      setSecret(null)
      setFactorId(null)
      setVerifyCode('')
      setEnrolling(false)
      await loadFactors()
    } catch (err: unknown) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Verification failed' })
    } finally {
      setLoading(false)
    }
  }

  async function handleUnenroll(factorId: string) {
    if (!confirm('Remove this authenticator app?')) return
    setMessage(null)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.mfa.unenroll({ factorId })
      if (error) throw new Error(error.message)
      setMessage({ type: 'success', text: 'Authenticator app removed.' })
      await loadFactors()
    } catch (err: unknown) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to remove' })
    }
  }

  const verifiedFactors = factors.filter(f => f.verified)

  return (
    <div>
      <h1>Security</h1>
      <p style={{ color: '#666', marginBottom: 24 }}>
        Add an extra layer of security with an authenticator app (Google Authenticator, Authy, etc.).
        After setup, you&apos;ll be prompted for a code when signing in.
      </p>

      {message && (
        <div className={message.type === 'success' ? 'success' : 'error'} role="alert">
          {message.text}
          <button
            onClick={() => setMessage(null)}
            style={{ float: 'right', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, fontSize: 16 }}
            aria-label="Dismiss"
          >
            &times;
          </button>
        </div>
      )}

      {verifiedFactors.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h2>Configured Authenticators</h2>
          {verifiedFactors.map(f => (
            <div key={f.id} className={`card ${styles.cardItem}`}>
              <div className={styles.cardContent}>
                <div>
                  <strong>Authenticator App</strong>
                  <p className="text-muted fs-13">TOTP — Verified</p>
                </div>
                <div className={styles.cardActions}>
                  <button className="btn btn-danger btn-sm" onClick={() => handleUnenroll(f.id)}>
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!qrCode && !enrolling && (
        <button className="btn btn-primary" onClick={handleEnroll}>
          Set Up Authenticator App
        </button>
      )}

      {qrCode && secret && (
        <div style={{ marginTop: 16 }}>
          <h2>Scan QR Code</h2>
          <p className="text-muted fs-13" style={{ marginBottom: 16 }}>
            Scan this QR code with your authenticator app, then enter the 6-digit code below to verify.
          </p>

          <div style={{ marginBottom: 16 }}>
            <img
              src={qrCode}
              alt="TOTP QR Code"
              style={{ width: 200, height: 200 }}
            />
          </div>

          <p className="text-muted fs-13" style={{ marginBottom: 16 }}>
            Or enter this secret manually: <code className="mono">{secret}</code>
          </p>

          <form onSubmit={handleVerify}>
            <div className="form-group">
              <label htmlFor="code">Verification Code</label>
              <input
                id="code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                value={verifyCode}
                onChange={e => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                style={{ maxWidth: 200 }}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading || verifyCode.length !== 6}>
              {loading ? 'Verifying...' : 'Verify & Activate'}
            </button>
            <button type="button" className="btn btn-secondary" style={{ marginLeft: 8 }} onClick={() => { setQrCode(null); setSecret(null); setFactorId(null); setEnrolling(false); }}>
              Cancel
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
