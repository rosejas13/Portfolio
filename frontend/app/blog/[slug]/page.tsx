import { fetchJson } from '@/lib/api-server'
import Link from 'next/link'

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const posts = await fetchJson<any[]>(`/posts?slug=eq.${slug}`)
  const post = posts[0]

  if (!post) return <div className="page container"><p>Post not found.</p></div>

  return (
    <div className="page">
      <div className="container">
        <Link href="/blog" style={{ fontSize: 14 }}>&larr; Back to blog</Link>
        <h1 style={{ marginTop: 12 }}>{post.title}</h1>
        <div style={{ fontSize: 13, color: '#888', marginBottom: 20 }}>
          {new Date(post.created_at).toLocaleDateString()}
          {post.tags && post.tags.map((t: string) => <span key={t} className="tag" style={{ marginLeft: 8 }}>{t}</span>)}
        </div>
        {post.content && <div style={{ lineHeight: 1.8 }}>{post.content}</div>}
      </div>
    </div>
  )
}
