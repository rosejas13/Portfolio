'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import styles from './admin.module.css'

const links = [
  { to: '/admin', label: 'Dashboard' },
  { to: '/admin/projects', label: 'Projects' },
  { to: '/admin/skills', label: 'Skills' },
  { to: '/admin/experience', label: 'Experience' },
  { to: '/admin/education', label: 'Education' },
  { to: '/admin/blog', label: 'Blog Posts' },
  { to: '/admin/leads', label: 'Leads' },
  { to: '/admin/config', label: 'Site Config' },
  { to: '/admin/metrics', label: 'Metrics' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [loading, setLoading] = useState(true)

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me')
      if (!res.ok) {
        router.push('/admin/login')
      }
    } catch {
      router.push('/admin/login')
    } finally {
      setLoading(false)
    }
  }, [router])

  const isLoginPage = pathname === '/admin/login'

  useEffect(() => {
    if (isLoginPage) {
      setLoading(false)
      return
    }
    checkAuth()
    const interval = setInterval(checkAuth, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [checkAuth, isLoginPage])

  if (loading) return null

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  return (
    <div className="page">
      <div className="container">
        <div className="sidebar-layout">
          <aside className="sidebar">
            <h3 className={styles.sidebarTitle}>Admin Panel</h3>
            <Link href="/" className={styles.backLink}>&larr; Back to site</Link>
            {links.map(l => (
              <Link key={l.to} href={l.to} className={pathname === l.to ? 'active' : ''}>{l.label}</Link>
            ))}
            <hr className={styles.sidebarDivider} />
            <a href="#" onClick={e => { e.preventDefault(); logout() }} className={styles.logoutLink}>Logout</a>
          </aside>
          <div>{children}</div>
        </div>
      </div>
    </div>
  )
}
