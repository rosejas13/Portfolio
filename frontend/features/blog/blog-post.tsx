import { fetchJson } from '@/lib/api-server'
import type { Post } from '@/lib/types'
import Link from 'next/link'
import styles from './blog.module.css'

export default async function BlogPost({ slug }: { slug: string }) {
  const posts = await fetchJson<Post[]>(`/posts?slug=eq.${slug}`, [])
  const post = posts[0]

  if (!post) return <div className="page container"><p>Post not found.</p></div>

  return (
    <div className="page">
      <div className="container">
        <Link href="/blog" className={styles.backLink}>&larr; Back to blog</Link>
        <h1 className={styles.pageTitle}>{post.title}</h1>
        <div className={styles.postMeta}>
          {new Date(post.created_at).toLocaleDateString()}
          {post.tags && post.tags.map(t => <span key={t} className={`tag ${styles.tagItem}`}>{t}</span>)}
        </div>
        {post.content && <div className={styles.content}>{post.content}</div>}
      </div>
    </div>
  )
}
