import { API_URL as API, SUPABASE_ANON_KEY } from './config'

export async function fetchJson<T>(path: string, fallback: T, options?: RequestInit): Promise<T> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options?.headers as Record<string, string>),
    }
    if (SUPABASE_ANON_KEY) {
      headers['apikey'] = SUPABASE_ANON_KEY
      headers['Authorization'] = `Bearer ${SUPABASE_ANON_KEY}`
    }

    const res = await fetch(`${API}${path}`, {
      ...options,
      headers,
      next: { revalidate: 60 },
    })
    if (!res.ok) return fallback
    return res.json()
  } catch {
    return fallback
  }
}
