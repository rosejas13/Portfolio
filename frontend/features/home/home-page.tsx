import { fetchJson } from '@/lib/api-server'
import type { Post } from '@/lib/types'
import Link from 'next/link'
import { RoseIcon } from '@/lib/rose-icon'
import styles from './home.module.css'

export default async function HomePage() {
  const config = await fetchJson<Record<string, string>>('/rpc/get_site_config', {})
  const posts = await fetchJson<Post[]>('/posts?order=created_at.desc&status=eq.published&limit=2', [])

  return (
    <div className="page">
      <div className="container">
        <section className={styles.hero}>
          <div className={styles.roseMotif} aria-hidden="true">
            <RoseIcon size={96} />
          </div>
          <h1 className={styles.heroTitle}>{config.hero_tagline || 'Software Engineer'}</h1>
          <p>{config.hero_bio || ''}</p>
          <div className={styles.heroActions}>
            <Link href="/projects" className="btn btn-primary">View Projects</Link>
            <Link href="/about" className="btn btn-secondary">About Me</Link>
            <Link href="/contact" className="btn btn-secondary">Contact</Link>
          </div>
          <div className={styles.socialLinks}>
            {config.social_github && <a href={config.social_github} target="_blank">GitHub</a>}
            {config.social_linkedin && <a href={config.social_linkedin} target="_blank">LinkedIn</a>}
            {config.social_email && <a href={`mailto:${config.social_email}`}>{config.social_email}</a>}
          </div>
        </section>

        {posts.length > 0 && (
          <section className={styles.recentPosts}>
            <div className={styles.postHeader}>
              <h2 className="m-0">Recent Posts</h2>
              <Link href="/blog" className="btn btn-secondary btn-sm">All posts</Link>
            </div>
            {posts.map(p => (
              <Link key={p.id} href={`/blog/${p.slug}`} className={styles.postLink}>
                <div className="card">
                  <h3>{p.title}</h3>
                  {p.excerpt && <p>{p.excerpt}</p>}
                  <div className={styles.postDate}>
                    {new Date(p.created_at).toLocaleDateString()}
                  </div>
                </div>
              </Link>
            ))}
          </section>
        )}
      </div>
    </div>
  )
}
