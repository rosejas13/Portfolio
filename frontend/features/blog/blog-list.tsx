import { Card, Tag, Text } from 'azimuth-ui'
import { fetchJson } from '@/lib/api-server'
import type { Post } from '@/lib/types'
import Link from 'next/link'
import styles from './blog.module.css'

export default async function BlogList() {
  const posts = await fetchJson<Post[]>('/posts?order=created_at.desc&limit=50', [])

  return (
    <div className="page">
      <div className="container">
        <Text as="h1" size="h1" weight="bold">
          Blog
        </Text>
        <Text size="lg" color="secondary" className={styles.subtitle}>
          Thoughts on building things.
        </Text>
        {posts.map((p) => (
          <Link key={p.id} href={`/blog/${p.slug}`} className={styles.cardLink}>
            <Card>
              <Text as="h3" size="h5" weight="semibold">
                {p.title}
              </Text>
              {p.excerpt && (
                <Text size="sm" color="secondary">
                  {p.excerpt}
                </Text>
              )}
              <div className={styles.meta}>
                <Text size="xs" color="muted" as="span">
                  {new Date(p.created_at).toLocaleDateString()}
                </Text>
                {p.tags &&
                  p.tags.map((t) => (
                    <Tag key={t} variant="neutral">
                      {t}
                    </Tag>
                  ))}
              </div>
            </Card>
          </Link>
        ))}
        {posts.length === 0 && (
          <Text color="muted" className={styles.empty}>
            No posts yet.
          </Text>
        )}
      </div>
    </div>
  )
}
