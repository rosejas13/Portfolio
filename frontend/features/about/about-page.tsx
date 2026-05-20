import { Card, Tag, Text } from '@azimuth/ui'
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
          <Text as="h1" size="h1" weight="bold">About</Text>
          <Text size="lg" color="secondary" className={styles.bio}>
            {config.hero_bio || 'Software Engineer with experience across full-stack development, AWS cloud architecture, and DevOps.'}
          </Text>
        </section>

        <section className={styles.section}>
          <Text as="h2" size="h2" weight="bold">Skills</Text>
          {Object.entries(byCategory).map(([cat, items]) => (
            <div key={cat} className={styles.categoryBlock}>
              <Text as="h3" size="base" weight="semibold" className={styles.categoryTitle}>{cat}</Text>
              <div className={styles.skillTags}>
                {items.map(s => <Tag key={s.id} variant="neutral">{s.name}</Tag>)}
              </div>
            </div>
          ))}
        </section>

        {experiences.length > 0 && (
          <section className={styles.section}>
            <Text as="h2" size="h2" weight="bold">Experience</Text>
            {experiences.map(exp => (
              <div key={exp.id} className={styles.expItem}>
                <div className={styles.expHeader}>
                  <Text as="h3" size="h5" weight="semibold" className={styles.expRole}>{exp.role}</Text>
                  <Text size="sm" color="muted" as="span" className={styles.expDate}>
                    {exp.start_date} — {exp.current ? 'Present' : exp.end_date}
                  </Text>
                </div>
                <Text className={styles.expCompany}>{exp.company}</Text>
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
            <Text as="h2" size="h2" weight="bold">Education</Text>
            {education.map(e => (
              <Card key={e.id}>
                <Text as="h3" size="h5" weight="semibold">{e.school}</Text>
                {[e.degree, e.field].filter(Boolean).length > 0 && (
                  <Text color="secondary" className={styles.eduCardText}>
                    {[e.degree, e.field].filter(Boolean).join(' in ')}
                  </Text>
                )}
                {e.start_date && (
                  <Text size="xs" color="muted" className={styles.eduCardDate}>
                    {e.start_date} — {e.end_date || 'Present'}
                  </Text>
                )}
              </Card>
            ))}
          </section>
        )}
      </div>
    </div>
  )
}
