import type { SyncAdapter, SyncResult } from './runner'
import { cacheGet, cacheSet } from './change-detection'

interface GitHubRepo {
  id: number
  name: string
  description: string | null
  html_url: string
  homepage: string | null
  topics: string[]
  language: string | null
  stargazers_count: number
  fork: boolean
  pushed_at: string
}

const GITHUB_API = 'https://api.github.com'

export function createGitHubAdapter(owner: string, repo?: string): SyncAdapter {
  return {
    name: 'github',
    async sync(): Promise<SyncResult> {
      const errors: { source: string; message: string }[] = []
      let items = 0
      let skipped = 0

      const cached = cacheGet<GitHubRepo[]>('github', 'repos')
      if (cached) {
        return { success: true, items: cached.length, skipped: 0, errors: [] }
      }

      const repos = await fetchRepos(owner, repo, errors)
      if (repos.length > 0) {
        cacheSet('github', 'repos', repos)
        items = repos.length
      } else {
        skipped = 0
      }

      return { success: errors.length === 0, items, skipped, errors }
    },
  }
}

async function fetchRepos(
  owner: string,
  repo?: string,
  errors: { source: string; message: string }[] = [],
): Promise<GitHubRepo[]> {
  const url = repo
    ? `${GITHUB_API}/repos/${owner}/${repo}`
    : `${GITHUB_API}/users/${owner}/repos?sort=updated&per_page=50&type=public`

  try {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'portfolio-sync',
    }
    const token = process.env.GITHUB_TOKEN || process.env.NEXT_PUBLIC_GITHUB_TOKEN
    if (token) headers['Authorization'] = `Bearer ${token}`

    const res = await fetch(url, { headers, signal: AbortSignal.timeout(10000) })
    if (!res.ok) {
      errors.push({ source: 'github', message: `HTTP ${res.status}: ${res.statusText}` })
      return []
    }
    const data = repo ? [await res.json()] : (await res.json())
    return (data as GitHubRepo[]).filter((r: GitHubRepo) => !r.fork)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch repos'
    errors.push({ source: 'github', message: msg })
    return []
  }
}
