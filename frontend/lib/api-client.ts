const API = process.env.NEXT_PUBLIC_API_PROXY ?? '/api'

export function authToken(): string | null {
  return sessionStorage.getItem('auth_token')
}

export function setAuthToken(token: string) {
  sessionStorage.setItem('auth_token', token)
}

export function csrfToken(): string {
  let t = sessionStorage.getItem('csrf_token')
  if (!t) {
    t = crypto.randomUUID()
    sessionStorage.setItem('csrf_token', t)
  }
  return t
}

function headers(): Record<string, string> {
  const h: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'X-CSRF-Token': csrfToken(),
  }
  const token = authToken()
  if (token) h['Authorization'] = `Bearer ${token}`
  return h
}

function errMessage(status: number): string {
  if (status === 401 || status === 403) return 'Unauthorized'
  if (status === 429) return 'Too many requests. Please try again later.'
  if (status >= 500) return 'Server error. Please try again later.'
  return 'Request failed. Please try again.'
}

async function handleResponse(res: Response): Promise<void> {
  if (!res.ok) throw new Error(errMessage(res.status))
}

export async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`, { headers: headers() })
  if (!res.ok) throw new Error(errMessage(res.status))
  return res.json()
}

export async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: { ...headers(), Prefer: 'return=representation' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(errMessage(res.status))
  const ct = res.headers.get('content-type')
  return ct?.includes('json') ? res.json() : undefined as T
}

export async function patch(path: string, body: unknown): Promise<void> {
  const res = await fetch(`${API}${path}`, {
    method: 'PATCH', headers: headers(), body: JSON.stringify(body),
  })
  await handleResponse(res)
}

export async function del(path: string): Promise<void> {
  const res = await fetch(`${API}${path}`, { method: 'DELETE', headers: headers() })
  await handleResponse(res)
}
