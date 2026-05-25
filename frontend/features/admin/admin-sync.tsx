'use client'

import { useEffect, useState } from 'react'
import { Card, Stack, Tag, Text } from 'azimuth-ui'
import { get } from '@/lib/api-client'
import { enabledSources } from '@/lib/sync/source-registry'
import { needsSync } from '@/lib/sync/change-detection'
import type { SyncRun, SyncState } from '@/lib/sync/types'
import styles from './admin.module.css'

interface SyncRunWithSource extends SyncRun {
  source_name: string
}

export default function AdminSync() {
  const [runs, setRuns] = useState<SyncRunWithSource[]>([])
  const [states, setStates] = useState<Record<string, SyncState>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      get<SyncRunWithSource[]>('/rpc/get_recent_syncs?max_rows=20'),
      get<SyncState[]>('/rpc/get_all_sync_states'),
    ]).then(([r, s]) => {
      setRuns(r || [])
      setStates(Object.fromEntries((s || []).map(st => [st.source_id, st])))
    }).finally(() => setLoading(false))
  }, [])

  const sources = enabledSources()

  return (
    <div>
      <h1>Sync Dashboard</h1>

      <Stack direction="horizontal" spacing="lg" className={styles.syncCards}>
        {sources.map(src => {
          const state = Object.values(states).find(s => s.source_id === src.name as unknown as number)
          const shouldSync = state ? needsSync(state) : true
          return (
            <Card key={src.name} className={styles.syncCard}>
              <Card.Content>
                <Text as="h3" size="h5" weight="semibold">{src.label}</Text>
                <Tag variant={shouldSync ? 'neutral' : 'success'}>
                  {shouldSync ? 'Needs sync' : 'Up to date'}
                </Tag>
                {state?.last_sync_at && (
                  <Text size="xs" color="muted">
                    Last: {new Date(state.last_sync_at).toLocaleString()}
                  </Text>
                )}
              </Card.Content>
            </Card>
          )
        })}
      </Stack>

      <Text as="h2" size="h3" weight="semibold" className={styles.sectionTitle}>
        Sync History
      </Text>

      {loading && <Text color="muted">Loading...</Text>}

      {!loading && runs.length === 0 && (
        <Text color="muted">No sync runs yet.</Text>
      )}

      {runs.length > 0 && (
        <table className={styles.tableWrap}>
          <thead>
            <tr>
              <th>Source</th>
              <th>Status</th>
              <th>Items</th>
              <th>Duration</th>
              <th>Started</th>
            </tr>
          </thead>
          <tbody>
            {runs.map(r => (
              <tr key={r.id}>
                <td>{r.source_name}</td>
                <td>
                  <Tag variant={statusVariant(r.status)}>{r.status}</Tag>
                </td>
                <td>{r.items_synced}</td>
                <td>{r.duration_ms ? `${(r.duration_ms / 1000).toFixed(1)}s` : '—'}</td>
                <td>{new Date(r.started_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

function statusVariant(status: string): 'success' | 'info' | 'neutral' | undefined {
  switch (status) {
    case 'success': return 'success'
    case 'error': return 'neutral'
    default: return undefined
  }
}
