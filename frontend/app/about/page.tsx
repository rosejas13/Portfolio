import { fetchJson } from '@/lib/api-server'

export default async function AboutPage() {
  const config = await fetchJson<Record<string, string>>('/rpc/get_site_config')
  const skills = await fetchJson<any[]>('/skills?order=sort_order.asc')
  const experiences = await fetchJson<any[]>('/experiences?order=sort_order.asc')
  const education = await fetchJson<any[]>('/education?order=sort_order.asc')

  const byCategory: Record<string, any[]> = {}
  for (const s of skills) {
    const cat = s.category || 'Other'
    if (!byCategory[cat]) byCategory[cat] = []
    byCategory[cat].push(s)
  }

  return (
    <div className="page">
      <div className="container">
        <section style={{ marginBottom: 40 }}>
          <h1>About</h1>
          <p style={{ color: '#555', lineHeight: 1.8, maxWidth: 600 }}>
            {config.hero_bio || 'Software Engineer with experience across full-stack development, AWS cloud architecture, and DevOps.'}
          </p>
        </section>

        <section style={{ marginBottom: 40 }}>
          <h2>Skills</h2>
          {Object.entries(byCategory).map(([cat, items]) => (
            <div key={cat} style={{ marginBottom: 16 }}>
              <h3 style={{ fontSize: 14, color: '#888', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>{cat}</h3>
              <div>{items.map((s: any) => <span key={s.id} className="tag">{s.name}</span>)}</div>
            </div>
          ))}
        </section>

        {experiences.length > 0 && (
          <section style={{ marginBottom: 40 }}>
            <h2>Experience</h2>
            {experiences.map((exp: any) => (
              <div key={exp.id} style={{ marginBottom: 24, paddingLeft: 20, borderLeft: '2px solid #e0e0e0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <h3 style={{ fontSize: 16, marginBottom: 2 }}>{exp.role}</h3>
                  <span style={{ fontSize: 13, color: '#888', whiteSpace: 'nowrap', marginLeft: 12 }}>
                    {exp.start_date} — {exp.current ? 'Present' : exp.end_date}
                  </span>
                </div>
                <p style={{ color: '#4361ee', fontSize: 14, marginBottom: 8 }}>{exp.company}</p>
                {exp.highlights && exp.highlights.length > 0 && (
                  <ul style={{ paddingLeft: 20, fontSize: 14, color: '#555', lineHeight: 1.7 }}>
                    {exp.highlights.map((h: string, i: number) => <li key={i}>{h}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </section>
        )}

        {education.length > 0 && (
          <section style={{ marginBottom: 40 }}>
            <h2>Education</h2>
            {education.map((e: any) => (
              <div key={e.id} className="card">
                <h3>{e.school}</h3>
                <p style={{ color: '#666' }}>{[e.degree, e.field].filter(Boolean).join(' in ')}</p>
                <p style={{ fontSize: 13, color: '#888' }}>{e.start_date} — {e.end_date || 'Present'}</p>
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  )
}
