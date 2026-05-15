'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

const links = [
  { to: '/admin', label: 'Dashboard' },
  { to: '/admin/projects', label: 'Projects' },
  { to: '/admin/skills', label: 'Skills' },
  { to: '/admin/experience', label: 'Experience' },
  { to: '/admin/education', label: 'Education' },
  { to: '/admin/blog', label: 'Blog Posts' },
  { to: '/admin/leads', label: 'Leads' },
  { to: '/admin/config', label: 'Site Config' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [authed, setAuthed] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/admin/login')
    } else {
      setAuthed(true)
    }
    setLoading(false)
  }, [router])

  if (loading) return null
  if (!authed) return null

  function logout() {
    localStorage.removeItem('token')
    router.push('/admin/login')
  }

  return (
    <div className="page">
      <div className="container">
        <div className="sidebar-layout">
          <aside className="sidebar">
            <h3 style={{ fontSize: 14, marginBottom: 12, padding: '0 12px' }}>Admin Panel</h3>
            <Link href="/" style={{ fontSize: 12, marginBottom: 8 }}>&larr; Back to site</Link>
            {links.map(l => (
              <Link key={l.to} href={l.to} className={pathname === l.to ? 'active' : ''}>{l.label}</Link>
            ))}
            <hr style={{ margin: '12px 0', border: 'none', borderTop: '1px solid #e0e0e0' }} />
            <a href="#" onClick={e => { e.preventDefault(); logout() }} style={{ cursor: 'pointer' }}>Logout</a>
          </aside>
          <div>{children}</div>
        </div>
      </div>
    </div>
  )
}
