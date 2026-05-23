import { Tag, Text } from 'azimuth-ui'
import { fetchJson } from '@/lib/api-server'
import type { Post } from '@/lib/types'
import Link from 'next/link'
import styles from './blog.module.css'

export default async function BlogPost({ slug }: { slug: string }) {
  const posts = await fetchJson<Post[]>(`/posts?slug=eq.${slug}`, [])
  const post = posts[0]

  if (!post)
    return (
      <div className="page container">
        <Text>Post not found.</Text>
      </div>
    )

  return (
    <div className="page">
      <div className="container">
        <Link href="/blog" className={styles.backLink}>
          &larr; Back to blog
        </Link>
        <Text as="h1" size="h1" weight="bold" className={styles.pageTitle}>
          {post.title}
        </Text>
        <div className={styles.postMeta}>
          <Text size="sm" color="muted" as="span">
            {new Date(post.created_at).toLocaleDateString()}
          </Text>
          {post.tags &&
            post.tags.map((t) => (
              <Tag key={t} variant="neutral" className={styles.tagItem}>
                {t}
              </Tag>
            ))}
        </div>
        {post.content && <div className={styles.content}>{post.content}</div>}
      </div>
    </div>
  )
}
