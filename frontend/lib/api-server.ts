const API = process.env.API_URL || 'http://localhost:3001'

export async function fetchJson<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    next: { revalidate: 60 },
  })
  if (!res.ok) {
    if (res.status === 401 || res.status === 403) throw new Error('Unauthorized')
    if (res.status === 429) throw new Error('Too many requests')
    if (res.status >= 500) throw new Error('Server error')
    throw new Error('Request failed')
  }
  return res.json()
}
