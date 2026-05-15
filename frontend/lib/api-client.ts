const API = process.env.NEXT_PUBLIC_API_URL || '/api'

function token(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token')
}

function headers(): Record<string, string> {
  const h: Record<string, string> = { 'Content-Type': 'application/json' }
  const t = token()
  if (t) h['Authorization'] = `Bearer ${t}`
  return h
}

export async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`, { headers: headers() })
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || `GET failed`)
  return res.json()
}

export async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: { ...headers(), Prefer: 'return=representation' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || `POST failed`)
  const ct = res.headers.get('content-type')
  return ct?.includes('json') ? res.json() : undefined as T
}

export async function patch(path: string, body: unknown): Promise<void> {
  const res = await fetch(`${API}${path}`, {
    method: 'PATCH', headers: headers(), body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || `PATCH failed`)
}

export async function del(path: string): Promise<void> {
  const res = await fetch(`${API}${path}`, { method: 'DELETE', headers: headers() })
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || `DELETE failed`)
}
