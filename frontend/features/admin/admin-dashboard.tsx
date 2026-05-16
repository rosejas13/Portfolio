'use client'

import { useState, useEffect } from 'react'
import type { Project, Skill, Post, Lead } from '@/lib/types'
import { get } from '@/lib/api-client'
import styles from './admin.module.css'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ projects: 0, skills: 0, posts: 0, leads: 0 })

  useEffect(() => {
    Promise.all([
      get<Project[]>('/projects?limit=1'),
      get<Skill[]>('/skills?limit=1'),
      get<Post[]>('/posts?limit=1'),
      get<Lead[]>('/leads?limit=1'),
    ]).then(([p, s, b, l]) => setStats({
      projects: p.length, skills: s.length, posts: b.length, leads: l.length,
    }))
  }, [])

  return (
    <div>
      <h1>Dashboard</h1>
      <p className={styles.dashboardSubtitle}>Overview of your portfolio.</p>
      <div className={`grid ${styles.dashboardGrid}`}>
        {Object.entries(stats).map(([key, val]) => (
          <div key={key} className={`card ${styles.statCard}`}>
            <div className={styles.statNumber}>{val}</div>
            <div className={styles.statLabel}>{key}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
