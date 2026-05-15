'use client'

import { useState, useEffect } from 'react'
import { get } from '@/lib/api-client'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ projects: 0, skills: 0, posts: 0, leads: 0 })

  useEffect(() => {
    Promise.all([get<any[]>('/projects'), get<any[]>('/skills'), get<any[]>('/posts'), get<any[]>('/leads')])
      .then(([p, s, b, l]) => setStats({ projects: p.length, skills: s.length, posts: b.length, leads: l.length }))
  }, [])

  return (
    <div>
      <h1>Dashboard</h1>
      <p style={{ color: '#666', marginBottom: 24 }}>Overview of your portfolio.</p>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
        {Object.entries(stats).map(([key, val]) => (
          <div key={key} className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#4361ee' }}>{val}</div>
            <div style={{ fontSize: 13, color: '#888', textTransform: 'capitalize' }}>{key}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
