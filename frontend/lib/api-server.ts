const API = process.env.API_URL || 'http://localhost:3001'

export async function fetchJson<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    next: { revalidate: 60 },
  })
  if (!res.ok) throw new Error(`API error: ${res.statusText}`)
  return res.json()
}
