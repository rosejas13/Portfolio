import { fetchJson } from '@/lib/api-server'
import Link from 'next/link'

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const projects = await fetchJson<any[]>(`/projects?slug=eq.${slug}`, [])
  const project = projects[0]

  if (!project) return <div className="page container"><p>Project not found.</p></div>

  return (
    <div className="page">
      <div className="container">
        <Link href="/projects" style={{ fontSize: 14 }}>&larr; Back to projects</Link>
        <h1 style={{ marginTop: 12 }}>{project.title}</h1>
        {project.tagline && <p style={{ color: '#666', fontSize: 16 }}>{project.tagline}</p>}
        {project.tech_stack && project.tech_stack.length > 0 && (
          <div style={{ margin: '16px 0' }}>
            {project.tech_stack.map((t: string) => <span key={t} className="tag">{t}</span>)}
          </div>
        )}
        {project.description && <div style={{ marginTop: 20, lineHeight: 1.8 }}>{project.description}</div>}
        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
          {project.live_url && <a href={project.live_url} className="btn btn-primary" target="_blank">Live site</a>}
          {project.repo_url && <a href={project.repo_url} className="btn btn-secondary" target="_blank">Source code</a>}
        </div>
      </div>
    </div>
  )
}
