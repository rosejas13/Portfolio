import { get, post } from '@/lib/api-client'
import type { SyncResult, SyncState, SyncStatus } from './types'
import { needsSync } from './change-detection'

export type { SyncResult }

export interface SyncAdapter {
  name: string
  sync(): Promise<SyncResult>
}

export async function runSync(adapter: SyncAdapter): Promise<SyncResult> {
  const state = await getSyncState(adapter.name)

  if (state && !needsSync(state)) {
    return { success: true, items: 0, skipped: 0, errors: [] }
  }

  const runId = await startRun(adapter.name)
  if (!runId) {
    return { success: false, items: 0, skipped: 0, errors: [{ source: 'system', message: 'Failed to start sync run' }] }
  }

  try {
    const result = await adapter.sync()
    const status: SyncStatus = result.errors.length > 0 ? 'partial' : 'success'
    await completeRun(runId, status, result)
    return result
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    await completeRun(runId, 'error', { success: false, items: 0, skipped: 0, errors: [{ source: adapter.name, message: msg }] })
    return { success: false, items: 0, skipped: 0, errors: [{ source: adapter.name, message: msg }] }
  }
}

async function getSyncState(name: string): Promise<SyncState | null> {
  try {
    return await get<SyncState>(`/rpc/get_sync_state?source_name=eq.${name}`)
  } catch {
    return null
  }
}

async function startRun(name: string): Promise<number | null> {
  try {
    const result = await post<{ id: number }>('/rpc/start_sync', { source_name: name })
    return result?.id ?? null
  } catch {
    return null
  }
}

async function completeRun(runId: number, status: SyncStatus, result: SyncResult): Promise<void> {
  try {
    await post('/rpc/complete_sync', {
      p_run_id: runId,
      p_status: status,
      p_items: result.items,
      p_skipped: result.skipped,
      p_errors: result.errors.length,
      p_error_details: result.errors,
    })
  } catch {
    // non-critical
  }
}
