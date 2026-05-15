import { fetchJson } from '@/lib/api-server'
import Link from 'next/link'

export default async function ProjectsPage() {
  const projects = await fetchJson<any[]>('/projects?order=sort_order.asc')

  return (
    <div className="page">
      <div className="container">
        <h1>Projects</h1>
        <div className="grid" style={{ marginTop: 20 }}>
          {projects.map((p: any) => (
            <Link key={p.id} href={`/projects/${p.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="card">
                <h3>{p.title}</h3>
                <p>{p.tagline}</p>
                {p.tech_stack && (
                  <div style={{ marginTop: 8 }}>
                    {p.tech_stack.map((t: string) => <span key={t} className="tag">{t}</span>)}
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
