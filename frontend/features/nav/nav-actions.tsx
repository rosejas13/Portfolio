'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

const links = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/projects', label: 'Projects' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' },
]

export function ThemeToggle() {
  const btnRef = useRef<HTMLButtonElement>(null)
  const [, forceRender] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const isDark = stored ? stored === 'dark' : prefersDark
    document.documentElement.classList.toggle('dark', isDark)
    setMounted(true)
  }, [])

  useEffect(() => {
    const el = btnRef.current
    if (!el) return
    function handler() {
      const added = document.documentElement.classList.toggle('dark')
      localStorage.setItem('theme', added ? 'dark' : 'light')
      forceRender(n => n + 1)
    }
    el.addEventListener('click', handler)
    return () => el.removeEventListener('click', handler)
  }, [])

  function isDark() {
    if (!mounted) return false
    return document.documentElement.classList.contains('dark')
  }

  return (
    <button
      ref={btnRef}
      className="theme-toggle-desktop"
      aria-label="Toggle dark mode"
    >
      {isDark() ? '\u2600' : '\u263E'}
    </button>
  )
}

export function MobileMenu() {
  const [open, setOpen] = useState(false)
  const [, setDrawerTick] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!open) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [open])

  function toggleTheme() {
    const added = document.documentElement.classList.toggle('dark')
    localStorage.setItem('theme', added ? 'dark' : 'light')
    setDrawerTick(n => n + 1)
  }

  const isDark = mounted && document.documentElement.classList.contains('dark')

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="hamburger-trigger"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
      >
        <span className="hamburger-line" style={{ transform: open ? 'translateY(6px) rotate(45deg)' : 'none' }} />
        <span className="hamburger-line" style={{ opacity: open ? 0 : 1 }} />
        <span className="hamburger-line" style={{ transform: open ? 'translateY(-6px) rotate(-45deg)' : 'none' }} />
      </button>

      {open && <div className="mobile-drawer-backdrop" onClick={() => setOpen(false)} />}

      <div className={`mobile-drawer${open ? ' open' : ''}`} aria-hidden={!open}>
        {links.map(l => (
          <Link key={l.href} href={l.href} className="mobile-drawer-link" onClick={() => setOpen(false)}>
            {l.label}
          </Link>
        ))}

        <hr className="mobile-drawer-divider" />

        <button onClick={toggleTheme} className="mobile-drawer-theme-btn">
          <span className="mobile-drawer-theme-icon">
            {isDark ? '\u2600' : '\u263E'}
          </span>
          {isDark ? 'Light mode' : 'Dark mode'}
        </button>
      </div>
    </>
  )
}
