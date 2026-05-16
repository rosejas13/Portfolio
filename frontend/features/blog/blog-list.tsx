import { fetchJson } from '@/lib/api-server'
import type { Post } from '@/lib/types'
import Link from 'next/link'
import styles from './blog.module.css'

export default async function BlogList() {
  const posts = await fetchJson<Post[]>('/posts?order=created_at.desc&limit=50', [])

  return (
    <div className="page">
      <div className="container">
        <h1>Blog</h1>
        <p className={styles.subtitle}>Thoughts on building things.</p>
        {posts.map(p => (
          <Link key={p.id} href={`/blog/${p.slug}`} className={styles.cardLink}>
            <div className="card">
              <h3>{p.title}</h3>
              {p.excerpt && <p>{p.excerpt}</p>}
              <div className={styles.meta}>
                <span>{new Date(p.created_at).toLocaleDateString()}</span>
                {p.tags && p.tags.map(t => <span key={t} className="tag">{t}</span>)}
              </div>
            </div>
          </Link>
        ))}
        {posts.length === 0 && <p className={styles.empty}>No posts yet.</p>}
      </div>
    </div>
  )
}
