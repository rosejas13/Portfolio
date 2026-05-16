import { API_URL as API } from './config'

export async function fetchJson<T>(path: string, fallback: T, options?: RequestInit): Promise<T> {
  try {
    const res = await fetch(`${API}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options?.headers },
      next: { revalidate: 60 },
    })
    if (!res.ok) return fallback
    return res.json()
  } catch {
    return fallback
  }
}
