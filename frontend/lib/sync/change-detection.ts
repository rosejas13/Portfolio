import type { SyncSource, SyncState } from './types'

const CACHE_PREFIX = 'sync_cache_'
const CACHE_TTL = 5 * 60 * 1000

export function needsSync(state: SyncState | null): boolean {
  if (!state?.last_sync_at) return true
  const ms = parseInterval(state.sync_interval)
  return Date.now() - new Date(state.last_sync_at).getTime() > ms
}

export function cacheGet<T>(source: SyncSource, key: string): T | null {
  try {
    const raw = sessionStorage.getItem(CACHE_PREFIX + source + '_' + key)
    if (!raw) return null
    const { data, ts } = JSON.parse(raw)
    if (Date.now() - ts > CACHE_TTL) {
      sessionStorage.removeItem(CACHE_PREFIX + source + '_' + key)
      return null
    }
    return data as T
  } catch {
    return null
  }
}

export function cacheSet<T>(source: SyncSource, key: string, data: T): void {
  const entry = JSON.stringify({ data, ts: Date.now() })
  sessionStorage.setItem(CACHE_PREFIX + source + '_' + key, entry)
}

function parseInterval(s: string): number {
  const match = s.match(/(\d+)\s*(hour|minute|day)/)
  if (!match) return 3600000
  const n = parseInt(match[1], 10)
  switch (match[2]) {
    case 'minute': return n * 60000
    case 'hour': return n * 3600000
    case 'day': return n * 86400000
    default: return 3600000
  }
}
