import { Card, Tag, Text } from 'azimuth-ui'
import { fetchJson } from '@/lib/api-server'
import type { Skill } from '@/lib/types'
import styles from './services.module.css'

const services = [
  {
    title: 'Systems Maintenance & DevOps',
    tagline: 'Keep your infrastructure running smoothly — your systems, not your headache.',
    items: [
      'AWS cloud architecture, migration, and cost optimization',
      'Infrastructure as code (Terraform, CloudFormation)',
      'CI/CD pipeline design and automation',
      'Monitoring, alerting, and incident response',
      'Container orchestration (Docker, ECS, Kubernetes)',
      'Database administration and performance tuning',
    ],
  },
  {
    title: 'Full-Stack Web Development',
    tagline: 'From concept to deployed product — clean, maintainable, production-grade.',
    items: [
      'Next.js / React applications with SSR and static generation',
      'API design and integration (REST, GraphQL, PostgREST)',
      'PostgreSQL schema design, migrations, and optimization',
      'Authentication, authorization, and session management',
      'SEO, Core Web Vitals, and accessibility audits',
      'Legacy codebase modernization and migration',
    ],
  },
  {
    title: 'Technical Consulting & Code Review',
    tagline: 'An experienced second pair of eyes before you ship.',
    items: [
      'Architecture review and planning for new projects',
      'Security audit and vulnerability remediation',
      'Performance profiling and optimization',
      'Code review with actionable, prioritized feedback',
      'Developer experience improvement (tooling, docs, CI)',
      'Technical due diligence for acquisitions or launches',
    ],
  },
]

export default async function ServicesPage() {
  const skills = await fetchJson<Skill[]>('/skills?order=sort_order.asc&limit=100', [])
  const relevantSkills = skills.filter((s) =>
    /devops|aws|cloud|docker|kubernetes|terraform|ci.?cd|linux|postgresql|react|next\.?js|typescript|node/i.test(
      s.name,
    ),
  )

  return (
    <div className="page">
      <div className="container">
        <Text as="h1" size="h1" weight="bold">
          Services
        </Text>
        <Text size="lg" color="secondary" className={styles.subtitle}>
          I help businesses build and maintain reliable software systems. My primary focus is
          systems maintenance and DevOps, with project-based development work available for the
          right engagement.
        </Text>

        <div className={styles.servicesGrid}>
          {services.map((s) => (
            <Card key={s.title}>
              <Text as="h3" size="h5" weight="semibold">
                {s.title}
              </Text>
              <Text size="sm" color="secondary" className={styles.tagline}>
                {s.tagline}
              </Text>
              <ul className={styles.serviceList}>
                {s.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </Card>
          ))}
        </div>

        <section className={styles.ctaSection}>
          <Text as="h2" size="h2" weight="bold">
            Ready to work together?
          </Text>
          <Text color="secondary" className={styles.ctaText}>
            Whether you need ongoing infrastructure maintenance, a new feature shipped, or a second
            opinion on your architecture — I&apos;d love to hear about your project.
          </Text>
          <a href="/contact" className="btn btn-primary">
            Get in touch
          </a>
        </section>

        <section className={styles.skillsSection}>
          <Text as="h2" size="h2" weight="bold">
            Relevant Skills
          </Text>
          <div className={styles.skillTags}>
            {relevantSkills.map((s) => (
              <Tag key={s.id} variant="neutral">
                {s.name}
              </Tag>
            ))}
          </div>
        </section>

        <section className={styles.processSection}>
          <Text as="h2" size="h2" weight="bold">
            How I Work
          </Text>
          <div className={styles.processGrid}>
            <div className={styles.processStep}>
              <span className={styles.stepNumber}>01</span>
              <Text as="h3" size="h5" weight="semibold">
                Discovery
              </Text>
              <Text size="sm" color="secondary">
                We discuss your needs, constraints, and timeline. No assumptions, no upsells.
              </Text>
            </div>
            <div className={styles.processStep}>
              <span className={styles.stepNumber}>02</span>
              <Text as="h3" size="h5" weight="semibold">
                Proposal
              </Text>
              <Text size="sm" color="secondary">
                I outline scope, deliverables, timeline, and fixed or retainer pricing.
              </Text>
            </div>
            <div className={styles.processStep}>
              <span className={styles.stepNumber}>03</span>
              <Text as="h3" size="h5" weight="semibold">
                Execution
              </Text>
              <Text size="sm" color="secondary">
                Regular updates, transparent communication, and a bias toward shipping.
              </Text>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
