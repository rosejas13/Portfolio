export type SyncSource = 'github' | 'linkedin' | 'resume_upload'

export type SyncStatus = 'running' | 'success' | 'error' | 'partial'

export interface SyncSourceConfig {
  name: SyncSource
  label: string
  enabled: boolean
  config?: Record<string, unknown>
}

export interface SyncRun {
  id: number
  source_id: number
  status: SyncStatus
  started_at: string
  finished_at?: string
  duration_ms?: number
  items_synced: number
  items_skipped: number
  error_count: number
  error_details?: { source: string; message: string }[]
}

export interface SyncState {
  source_id: number
  last_sync_at?: string
  last_success_at?: string
  last_change_at?: string
  etag?: string
  cursor?: string
  sync_interval: string
  needs_sync: boolean
}

export interface SyncHistoryItem {
  run: SyncRun
  source: SyncSourceConfig
}

export interface SyncResult {
  success: boolean
  items: number
  skipped: number
  errors: { source: string; message: string }[]
  metadata?: Record<string, unknown>
}
