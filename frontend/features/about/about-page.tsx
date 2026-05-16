import { fetchJson } from '@/lib/api-server'
import type { Skill, Experience, Education } from '@/lib/types'
import styles from './about.module.css'

export default async function AboutPage() {
  const [config, skills, experiences, education] = await Promise.all([
    fetchJson<Record<string, string>>('/rpc/get_site_config', {}),
    fetchJson<Skill[]>('/skills?order=sort_order.asc&limit=100', []),
    fetchJson<Experience[]>('/experiences?order=sort_order.asc&limit=100', []),
    fetchJson<Education[]>('/education?order=sort_order.asc&limit=100', []),
  ])

  const byCategory: Record<string, Skill[]> = {}
  for (const s of skills) {
    const cat = s.category || 'Other'
    if (!byCategory[cat]) byCategory[cat] = []
    byCategory[cat].push(s)
  }

  return (
    <div className="page">
      <div className="container">
        <section className={styles.section}>
          <h1>About</h1>
          <p className={styles.bio}>
            {config.hero_bio || 'Software Engineer with experience across full-stack development, AWS cloud architecture, and DevOps.'}
          </p>
        </section>

        <section className={styles.section}>
          <h2>Skills</h2>
          {Object.entries(byCategory).map(([cat, items]) => (
            <div key={cat} className={styles.categoryBlock}>
              <h3 className={styles.categoryTitle}>{cat}</h3>
              <div>{items.map(s => <span key={s.id} className="tag">{s.name}</span>)}</div>
            </div>
          ))}
        </section>

        {experiences.length > 0 && (
          <section className={styles.section}>
            <h2>Experience</h2>
            {experiences.map(exp => (
              <div key={exp.id} className={styles.expItem}>
                <div className={styles.expHeader}>
                  <h3 className={styles.expRole}>{exp.role}</h3>
                  <span className={styles.expDate}>
                    {exp.start_date} — {exp.current ? 'Present' : exp.end_date}
                  </span>
                </div>
                <p className={styles.expCompany}>{exp.company}</p>
                {exp.highlights && exp.highlights.length > 0 && (
                  <ul className={styles.expHighlights}>
                    {exp.highlights.map((h: string, i: number) => <li key={i}>{h}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </section>
        )}

        {education.length > 0 && (
          <section className={styles.section}>
            <h2>Education</h2>
            {education.map(e => (
              <div key={e.id} className="card">
                <h3>{e.school}</h3>
                <p className={styles.eduCardText}>{[e.degree, e.field].filter(Boolean).join(' in ')}</p>
                <p className={styles.eduCardDate}>{e.start_date} — {e.end_date || 'Present'}</p>
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  )
}
