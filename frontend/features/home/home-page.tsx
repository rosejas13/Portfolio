import { fetchJson } from '@/lib/api-server'
import Link from 'next/link'
import HomeClient from './home-client'

export default async function HomePage() {
  const config = await fetchJson<Record<string, string>>('/rpc/get_site_config', {})
  const posts = await fetchJson<any[]>('/posts?order=created_at.desc', [])
  const published = posts.filter((p: any) => p.status === 'published').slice(0, 2)

  return (
    <div className="page">
      <div className="container">
        <section className="hero">
          <h1>{config.hero_tagline || 'Software Engineer'}</h1>
          <p>{config.hero_bio || ''}</p>
          <div style={{ marginTop: 20, display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Link href="/projects" className="btn btn-primary">View Projects</Link>
            <Link href="/about" className="btn btn-secondary">About Me</Link>
            <Link href="/contact" className="btn btn-secondary">Contact</Link>
          </div>
          <div style={{ marginTop: 12, display: 'flex', gap: 12, justifyContent: 'center', fontSize: 13, color: '#888' }}>
            {config.social_github && <a href={config.social_github} target="_blank">GitHub</a>}
            {config.social_linkedin && <a href={config.social_linkedin} target="_blank">LinkedIn</a>}
            {config.social_email && <a href={`mailto:${config.social_email}`}>{config.social_email}</a>}
          </div>
        </section>

        {published.length > 0 && (
          <section style={{ marginTop: 40 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ margin: 0 }}>Recent Posts</h2>
              <Link href="/blog" className="btn btn-secondary btn-sm">All posts</Link>
            </div>
            <HomeClient posts={published} />
          </section>
        )}
      </div>
    </div>
  )
}
