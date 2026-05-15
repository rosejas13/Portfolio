import { fetchJson } from '@/lib/api-server'
import Link from 'next/link'

export default async function BlogPage() {
  const posts = await fetchJson<any[]>('/posts?order=created_at.desc', [])

  return (
    <div className="page">
      <div className="container">
        <h1>Blog</h1>
        <p style={{ color: '#666', marginBottom: 24 }}>Thoughts on building things.</p>
        {posts.map((p: any) => (
          <Link key={p.id} href={`/blog/${p.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="card">
              <h3>{p.title}</h3>
              {p.excerpt && <p>{p.excerpt}</p>}
              <div style={{ display: 'flex', gap: 8, marginTop: 8, fontSize: 13, color: '#888' }}>
                <span>{new Date(p.created_at).toLocaleDateString()}</span>
                {p.tags && p.tags.map((t: string) => <span key={t} className="tag">{t}</span>)}
              </div>
            </div>
          </Link>
        ))}
        {posts.length === 0 && <p style={{ color: '#888' }}>No posts yet.</p>}
      </div>
    </div>
  )
}
