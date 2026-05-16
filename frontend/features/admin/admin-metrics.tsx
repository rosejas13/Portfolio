'use client'

import { useState, useEffect } from 'react'
import { get } from '@/lib/api-client'
import styles from './admin.module.css'

type MetricsData = {
  requests: { last_hour: number; last_24h: number; last_7d: number }
  errors: { last_hour: number; last_24h: number }
  top_endpoints: { path: string; count: number }[]
  roles_breakdown: Record<string, number>
  recent_errors: { error_code: string; error_msg: string; context: string; created_at: string }[]
  generated_at: string
}

export default function AdminMetrics() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    get<MetricsData>('/rpc/metrics')
      .then(setMetrics)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Failed to load metrics'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className={styles.loadingText}>Loading metrics...</p>
  if (error) return <div className="error">{error}</div>
  if (!metrics) return <p>No data.</p>

  return (
    <div>
      <h1>Metrics</h1>
      <p className={styles.metricsSubtitle}>
        Generated: {new Date(metrics.generated_at).toLocaleString()}
      </p>

      <div className={`grid ${styles.metricsGrid}`}>
        {[
          ['Requests (1h)', metrics.requests.last_hour],
          ['Requests (24h)', metrics.requests.last_24h],
          ['Requests (7d)', metrics.requests.last_7d],
          ['Errors (1h)', metrics.errors.last_hour],
          ['Errors (24h)', metrics.errors.last_24h],
        ].map(([label, val]) => (
          <div key={label} className={`card ${styles.metricCard}`}>
            <div className={styles.metricNumber}>{val}</div>
            <div className={styles.metricLabel}>{label}</div>
          </div>
        ))}
      </div>

      {Object.keys(metrics.roles_breakdown).length > 0 && (
        <>
          <h2>Requests by Role (24h)</h2>
          <table className={styles.metricsTable}>
            <thead><tr><th>Role</th><th>Requests</th></tr></thead>
            <tbody>
              {Object.entries(metrics.roles_breakdown)
                .sort(([, a], [, b]) => b - a)
                .map(([role, count]) => (
                  <tr key={role}><td className={styles.cellBold}>{role}</td><td>{count}</td></tr>
                ))}
            </tbody>
          </table>
        </>
      )}

      {metrics.top_endpoints.length > 0 && (
        <>
          <h2>Top Endpoints (24h)</h2>
          <table className={styles.metricsTable}>
            <thead><tr><th>Path</th><th>Hits</th></tr></thead>
            <tbody>
              {metrics.top_endpoints.map(e => (
                <tr key={e.path}><td className={styles.cellMono}>{e.path}</td><td>{e.count}</td></tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {metrics.recent_errors.length > 0 && (
        <>
          <h2>Recent Errors</h2>
          <table>
            <thead><tr><th>Time</th><th>Code</th><th>Message</th><th>Context</th></tr></thead>
            <tbody>
              {metrics.recent_errors.map((e, i) => (
                <tr key={i}>
                  <td className={styles.cellSmall}>{new Date(e.created_at).toLocaleString()}</td>
                  <td className={styles.cellMonoSmall}>{e.error_code}</td>
                  <td className={styles.cellMedium}>{e.error_msg}</td>
                  <td className={styles.cellTiny}>{e.context}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  )
}
