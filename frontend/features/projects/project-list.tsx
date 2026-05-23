import { Card, Grid, Tag, Text } from 'azimuth-ui'
import { fetchJson } from '@/lib/api-server'
import type { Project } from '@/lib/types'
import Link from 'next/link'
import styles from './projects.module.css'

export default async function ProjectList() {
  const projects = await fetchJson<Project[]>('/projects?order=sort_order.asc&limit=50', [])

  return (
    <div className="page">
      <div className="container">
        <Text as="h1" size="h1" weight="bold">
          Projects
        </Text>
        <Grid cols="auto" gap="lg" className={styles.grid}>
          {projects.map((p) => (
            <Link key={p.id} href={`/projects/${p.slug}`} className={styles.cardLink}>
              <Card>
                <Text as="h3" size="h5" weight="semibold">
                  {p.title}
                </Text>
                <Text size="sm" color="secondary">
                  {p.tagline}
                </Text>
                {p.tech_stack && (
                  <div className={styles.techStack}>
                    {p.tech_stack.map((t) => (
                      <Tag key={t} variant="neutral">
                        {t}
                      </Tag>
                    ))}
                  </div>
                )}
              </Card>
            </Link>
          ))}
        </Grid>
      </div>
    </div>
  )
}
