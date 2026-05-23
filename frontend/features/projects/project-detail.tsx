import { Tag, Text } from 'azimuth-ui'
import { fetchJson } from '@/lib/api-server'
import type { Project } from '@/lib/types'
import Link from 'next/link'
import styles from './projects.module.css'

export default async function ProjectDetail({ slug }: { slug: string }) {
  const projects = await fetchJson<Project[]>(`/projects?slug=eq.${slug}`, [])
  const project = projects[0]

  if (!project)
    return (
      <div className="page container">
        <Text>Project not found.</Text>
      </div>
    )

  return (
    <div className="page">
      <div className="container">
        <Link href="/projects" className={styles.backLink}>
          &larr; Back to projects
        </Link>
        <Text as="h1" size="h1" weight="bold" className={styles.pageTitle}>
          {project.title}
        </Text>
        {project.tagline && (
          <Text size="h5" color="secondary" className={styles.tagline}>
            {project.tagline}
          </Text>
        )}
        {project.tech_stack && project.tech_stack.length > 0 && (
          <div className={styles.techStack}>
            {project.tech_stack.map((t) => (
              <Tag key={t} variant="neutral">
                {t}
              </Tag>
            ))}
          </div>
        )}
        {project.description && <div className={styles.description}>{project.description}</div>}
        <div className={styles.actions}>
          {project.live_url && (
            <a
              href={project.live_url}
              className="btn btn-primary"
              target="_blank"
              rel="noopener noreferrer"
            >
              Live site
            </a>
          )}
          {project.repo_url && (
            <a
              href={project.repo_url}
              className="btn btn-secondary"
              target="_blank"
              rel="noopener noreferrer"
            >
              Source code
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
