import { Card, Text } from 'azimuth-ui'
import { fetchJson } from '@/lib/api-server'
import type { Post } from '@/lib/types'
import Link from 'next/link'
import { RoseMotif } from '@/lib/rose-motif'
import styles from './home.module.css'

export default async function HomePage() {
  const config = await fetchJson<Record<string, string>>('/rpc/get_site_config', {})
  const posts = await fetchJson<Post[]>(
    '/posts?order=created_at.desc&status=eq.published&limit=2',
    [],
  )

  return (
    <div className="page">
      <div className="container">
        <section className={styles.hero}>
          <h1 className={styles.heroTitle}>{config.hero_tagline || 'Software Engineer'}</h1>
          <p>{config.hero_bio || ''}</p>
          <div className={styles.heroActions}>
            <Link href="/projects" className="btn btn-primary">
              View Projects
            </Link>
            <Link href="/about" className="btn btn-secondary">
              About Me
            </Link>
            <Link href="/contact" className="btn btn-secondary">
              Contact
            </Link>
          </div>
          <nav className={styles.socialLinks} aria-label="Social links">
            {config.social_github && (
              <a href={config.social_github} target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
            )}
            {config.social_linkedin && (
              <a href={config.social_linkedin} target="_blank" rel="noopener noreferrer">
                LinkedIn
              </a>
            )}
            {config.social_email && (
              <a href={`mailto:${config.social_email}`}>{config.social_email}</a>
            )}
          </nav>
          <div className={styles.roseMotif} aria-hidden="true">
            <RoseMotif size={96} />
          </div>
        </section>

        {posts.length > 0 && (
          <section className={styles.recentPosts}>
            <div className={styles.postHeader}>
              <Text as="h2" size="h2" weight="bold">
                Recent Posts
              </Text>
              <Link href="/blog" className="btn btn-secondary btn-sm">
                All posts
              </Link>
            </div>
            {posts.map((p) => (
              <Link
                key={p.id}
                href={`/blog/${p.slug}`}
                className={styles.postLink}
                aria-label={p.title}
              >
                <Card>
                  <Text as="h3" size="h5" weight="semibold">
                    {p.title}
                  </Text>
                  {p.excerpt && (
                    <Text size="sm" color="secondary">
                      {p.excerpt}
                    </Text>
                  )}
                  <Text size="xs" color="muted">
                    {new Date(p.created_at).toLocaleDateString()}
                  </Text>
                </Card>
              </Link>
            ))}
          </section>
        )}
      </div>
    </div>
  )
}
