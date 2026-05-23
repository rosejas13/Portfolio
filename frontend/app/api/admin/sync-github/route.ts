import { NextRequest, NextResponse } from 'next/server'
import { API_URL } from '@/lib/config'

const GITHUB_USERNAME = 'rosejas13'

type GitHubRepo = {
  name: string
  description: string | null
  topics: string[]
  html_url: string
  homepage: string | null
  fork: boolean
  archived: boolean
  disabled: boolean
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[\s_.]+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export async function POST(request: NextRequest) {
  const auth = request.headers.get('Authorization')
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const headers = {
    'Content-Type': 'application/json',
    Authorization: auth,
  }

  try {
    const repoRes = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated&type=owner`,
      {
        headers: process.env.GITHUB_TOKEN
          ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
          : {},
      },
    )
    if (!repoRes.ok) {
      const body = await repoRes.text()
      return NextResponse.json(
        { error: `GitHub API error (${repoRes.status}): ${body}` },
        { status: 502 },
      )
    }

    const repos: GitHubRepo[] = await repoRes.json()

    const existingRes = await fetch(`${API_URL}/projects?select=slug,repo_url`, { headers })
    if (!existingRes.ok) {
      return NextResponse.json({ error: 'Failed to fetch existing projects' }, { status: 502 })
    }
    const existing: { slug: string; repo_url: string | null }[] = await existingRes.json()
    const byRepoUrl = new Map(existing.filter(p => p.repo_url).map(p => [p.repo_url, p]))
    const bySlug = new Map(existing.map(p => [p.slug, p]))

    const results = { created: 0, updated: 0, skipped: 0, errors: 0 }
    const errors: string[] = []

    for (const repo of repos) {
      if (repo.fork || repo.archived || repo.disabled) {
        results.skipped++
        continue
      }

      const slug = slugify(repo.name)
      const project = {
        title: repo.name,
        slug,
        tagline: repo.description || '',
        tech_stack: repo.topics?.length ? repo.topics : null,
        repo_url: repo.html_url,
        live_url: repo.homepage || null,
        status: 'draft',
      }

      const match = byRepoUrl.get(repo.html_url) || bySlug.get(slug)
      if (match) {
        const patchRes = await fetch(`${API_URL}/projects?slug=eq.${match.slug}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify(project),
        })
        if (!patchRes.ok) {
          errors.push(`Failed to update ${repo.name}: ${patchRes.status}`)
          results.errors++
        } else {
          results.updated++
        }
      } else {
        const postRes = await fetch(`${API_URL}/projects`, {
          method: 'POST',
          headers: { ...headers, Prefer: 'return=minimal' },
          body: JSON.stringify(project),
        })
        if (!postRes.ok) {
          errors.push(`Failed to create ${repo.name}: ${postRes.status}`)
          results.errors++
        } else {
          results.created++
        }
      }
    }

    return NextResponse.json({ ...results, repos_found: repos.length, errors: errors.length ? errors : undefined })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 502 })
  }
}
