import { Stack, Tag, Text } from 'azimuth-ui'
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
            <Text as="h1" variant="display" size="h1" weight="bold">
              Jasper Cordova
            </Text>
            <Text size="h5" color="secondary" className={styles.title}>
              {config.hero_tagline || 'Software Engineer'}
            </Text>
            <Stack direction="horizontal" spacing="lg">
              {config.social_email && (
                <Text size="sm" color="muted" as="span">
                  {config.social_email}
                </Text>
              )}
              {config.social_github && (
                <Text size="sm" color="muted" as="span">
                  {config.social_github.replace('https://', '')}
                </Text>
              )}
            </Stack>
          </div>
          <button className="btn btn-primary" onClick={() => window.print()}>
            Download PDF
          </button>
        </div>

        <section className={styles.section}>
          <Text as="h2" size="h3" weight="semibold" className={styles.sectionTitle}>
            Skills
          </Text>
          {Object.entries(byCategory).map(([cat, items]) => (
            <div key={cat} className={styles.categoryBlock}>
              <Text as="span" size="sm" weight="semibold" color="secondary" className={styles.categoryName}>
                {cat}
              </Text>
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
            <Text as="h2" size="h3" weight="semibold" className={styles.sectionTitle}>
              Experience
            </Text>
            {experiences.map((exp) => (
              <div key={exp.id} className={styles.expItem}>
                <div className={styles.expHeader}>
                  <Text as="h3" size="h5" weight="semibold" className={styles.expRole}>
                    {exp.role}
                  </Text>
                  <Text size="sm" color="muted" as="span" className={styles.expDate}>
                    {exp.start_date} — {exp.current ? 'Present' : exp.end_date}
                  </Text>
                </div>
                <Text className={styles.expCompany}>{exp.company}</Text>
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
            <Text as="h2" size="h3" weight="semibold" className={styles.sectionTitle}>
              Projects
            </Text>
            {projects.map((p) => (
              <div key={p.id} className={styles.projectItem}>
                <div className={styles.projectHeader}>
                  <Text as="h3" size="h5" weight="semibold" className={styles.projectName}>
                    {p.title}
                  </Text>
                  {p.tech_stack && p.tech_stack.length > 0 && (
                    <Text size="sm" color="muted" as="span" className={styles.projectTech}>
                      {p.tech_stack.join(' · ')}
                    </Text>
                  )}
                </div>
                {p.tagline && (
                  <Text size="sm" color="secondary" className={styles.projectTagline}>
                    {p.tagline}
                  </Text>
                )}
              </div>
            ))}
          </section>
        )}

        {education.length > 0 && (
          <section className={styles.section}>
            <Text as="h2" size="h3" weight="semibold" className={styles.sectionTitle}>
              Education
            </Text>
            {education.map((e) => (
              <div key={e.id} className={styles.eduItem}>
                <Text as="h3" size="h5" weight="semibold" className={styles.eduSchool}>
                  {e.school}
                </Text>
                {[e.degree, e.field].filter(Boolean).length > 0 && (
                  <Text color="secondary" className={styles.eduDetail}>
                    {[e.degree, e.field].filter(Boolean).join(' in ')}
                  </Text>
                )}
                {e.start_date && (
                  <Text size="sm" color="muted" className={styles.eduDate}>
                    {e.start_date} — {e.end_date || 'Present'}
                  </Text>
                )}
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  )
}
