import { fetchJson } from '@/lib/api-server'
import type { Project } from '@/lib/types'
import Link from 'next/link'
import styles from './projects.module.css'

export default async function ProjectList() {
  const projects = await fetchJson<Project[]>('/projects?order=sort_order.asc&limit=50', [])

  return (
    <div className="page">
      <div className="container">
        <h1>Projects</h1>
        <div className={`grid ${styles.grid}`}>
          {projects.map(p => (
            <Link key={p.id} href={`/projects/${p.slug}`} className={styles.cardLink}>
              <div className="card">
                <h3>{p.title}</h3>
                <p>{p.tagline}</p>
                {p.tech_stack && (
                  <div className={styles.techStack}>
                    {p.tech_stack.map(t => <span key={t} className="tag">{t}</span>)}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
