'use client'

import Link from 'next/link'

export default function HomeClient({ posts }: { posts: any[] }) {
  return posts.map(p => (
    <Link key={p.id} href={`/blog/${p.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className="card">
        <h3>{p.title}</h3>
        {p.excerpt && <p>{p.excerpt}</p>}
        <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>
          {new Date(p.created_at).toLocaleDateString()}
        </div>
      </div>
    </Link>
  ))
}
