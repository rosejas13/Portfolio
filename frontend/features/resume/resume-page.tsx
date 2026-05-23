import { Tag, Text } from 'azimuth-ui'
import { fetchJson } from '@/lib/api-server'
import type { Skill, Experience, Education, Project as ProjectType } from '@/lib/types'
import styles from './resume.module.css'

function groupByCategory(skills: Skill[]): Record<string, Skill[]> {
  const map: Record<string, Skill[]> = {}
  for (const s of skills) {
    const cat = s.category || 'Other'
    if (!map[cat]) map[cat] = []
    map[cat].push(s)
  }
  return map
}

export default async function ResumePage() {
  const [config, skills, experiences, education, projects] = await Promise.all([
    fetchJson<Record<string, string>>('/rpc/get_site_config', {}),
    fetchJson<Skill[]>('/skills?order=sort_order.asc&limit=100', []),
    fetchJson<Experience[]>('/experiences?order=sort_order.asc&limit=100', []),
    fetchJson<Education[]>('/education?order=sort_order.asc&limit=100', []),
    fetchJson<ProjectType[]>('/projects?status=eq.published&order=sort_order.asc&limit=20', []),
  ])

  const byCategory = groupByCategory(skills)

  return (
    <div className="page">
      <div className="container">
        <div className={styles.header}>
          <div>
            <h1 className={styles.name}>Jasper Cordova</h1>
            <p className={styles.title}>{config.hero_tagline || 'Software Engineer'}</p>
            <div className={styles.contact}>
              {config.social_email && <span>{config.social_email}</span>}
              {config.social_github && <span>{config.social_github.replace('https://', '')}</span>}
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => window.print()}>
            Download PDF
          </button>
        </div>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Skills</h2>
          {Object.entries(byCategory).map(([cat, items]) => (
            <div key={cat} className={styles.categoryBlock}>
              <span className={styles.categoryName}>{cat}</span>
              <div className={styles.skillTags}>
                {items.map((s) => (
                  <Tag key={s.id} variant="neutral">{s.name}</Tag>
                ))}
              </div>
            </div>
          ))}
        </section>

        {experiences.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Experience</h2>
            {experiences.map((exp) => (
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
                    {exp.highlights.map((h: string, i: number) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </section>
        )}

        {projects.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Projects</h2>
            {projects.map((p) => (
              <div key={p.id} className={styles.projectItem}>
                <div className={styles.projectHeader}>
                  <h3 className={styles.projectName}>{p.title}</h3>
                  {p.tech_stack && p.tech_stack.length > 0 && (
                    <span className={styles.projectTech}>{p.tech_stack.join(' · ')}</span>
                  )}
                </div>
                {p.tagline && <p className={styles.projectTagline}>{p.tagline}</p>}
              </div>
            ))}
          </section>
        )}

        {education.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Education</h2>
            {education.map((e) => (
              <div key={e.id} className={styles.eduItem}>
                <h3 className={styles.eduSchool}>{e.school}</h3>
                {[e.degree, e.field].filter(Boolean).length > 0 && (
                  <p className={styles.eduDetail}>
                    {[e.degree, e.field].filter(Boolean).join(' in ')}
                  </p>
                )}
                {e.start_date && (
                  <p className={styles.eduDate}>
                    {e.start_date} — {e.end_date || 'Present'}
                  </p>
                )}
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  )
}
