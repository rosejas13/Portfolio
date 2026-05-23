'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Project, Skill, Post, Lead } from '@/lib/types'
import { get } from '@/lib/api-client'
import styles from './admin.module.css'

type SyncResult = {
  created: number
  updated: number
  skipped: number
  repos_found: number
  errors?: string[]
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({ projects: 0, skills: 0, posts: 0, leads: 0 })
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null)
  const [syncError, setSyncError] = useState('')

  const refresh = useCallback(() => {
    Promise.all([
      get<Project[]>('/projects?limit=1'),
      get<Skill[]>('/skills?limit=1'),
      get<Post[]>('/posts?limit=1'),
      get<Lead[]>('/leads?limit=1'),
    ]).then(([p, s, b, l]) => setStats({
      projects: p.length, skills: s.length, posts: b.length, leads: l.length,
    }))
  }, [])

  useEffect(refresh, [refresh])

  async function syncGitHub() {
    setSyncing(true)
    setSyncResult(null)
    setSyncError('')
    try {
      const res = await fetch('/api/admin/sync-github', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        setSyncError(data.error || 'Sync failed')
      } else {
        setSyncResult(data)
        refresh()
      }
    } catch {
      setSyncError('Network error')
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div>
      <div className={styles.crudHeader}>
        <div>
          <h1>Dashboard</h1>
          <p className={styles.dashboardSubtitle}>Overview of your portfolio.</p>
        </div>
        <button className="btn btn-secondary" onClick={syncGitHub} disabled={syncing}>
          {syncing ? 'Syncing...' : 'Sync GitHub'}
        </button>
      </div>

      {syncResult && (
        <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
          <p style={{ fontWeight: 600, color: 'var(--color-primary)' }}>Sync complete</p>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--fs-sm)' }}>
            {syncResult.created} created, {syncResult.updated} updated, {syncResult.skipped} skipped
            &nbsp;({syncResult.repos_found} repos found)
          </p>
          {syncResult.errors && syncResult.errors.length > 0 && (
            <p style={{ marginTop: 'var(--space-xs)', color: 'var(--color-error-text)', fontSize: 'var(--fs-sm)' }}>
              {syncResult.errors.length} error{(syncResult.errors.length > 1) ? 's' : ''}. Check server logs.
            </p>
          )}
        </div>
      )}

      {syncError && (
        <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
          <p style={{ color: 'var(--color-error-text)', fontSize: 'var(--fs-sm)' }}>{syncError}</p>
        </div>
      )}

      <div className={`grid ${styles.dashboardGrid}`}>
        {Object.entries(stats).map(([key, val]) => (
          <div key={key} className={`card ${styles.statCard}`}>
            <div className={styles.statNumber}>{val}</div>
            <div className={styles.statLabel}>{key}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
