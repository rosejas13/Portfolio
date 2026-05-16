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
      style={{
        background: 'none',
        border: '1px solid var(--color-border)',
        borderRadius: 6,
        cursor: 'pointer',
        fontSize: 18,
        lineHeight: 1,
        padding: '4px 8px',
        color: 'var(--color-text)',
        minWidth: 34,
        minHeight: 34,
      }}
    >
      {isDark() ? '\u2600' : '\u263E'}
    </button>
  )
}

export function MobileMenu() {
  const [open, setOpen] = useState(false)
  const [, setDrawerTick] = useState(0)

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

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Close menu' : 'Open menu'}
        style={{
          display: 'none',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
          background: 'none',
          border: 'none',
          borderRadius: 6,
          cursor: 'pointer',
          padding: 6,
          color: 'var(--color-text)',
        }}
        className="hamburger-trigger"
      >
        <span style={{ display: 'block', width: 20, height: 2, background: 'currentColor', borderRadius: 1, transition: 'transform 0.2s ease', transform: open ? 'translateY(6px) rotate(45deg)' : 'none' }} />
        <span style={{ display: 'block', width: 20, height: 2, background: 'currentColor', borderRadius: 1, opacity: open ? 0 : 1, transition: 'opacity 0.2s ease' }} />
        <span style={{ display: 'block', width: 20, height: 2, background: 'currentColor', borderRadius: 1, transition: 'transform 0.2s ease', transform: open ? 'translateY(-6px) rotate(-45deg)' : 'none' }} />
      </button>
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 90,
          }}
        />
      )}
      <div
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, width: 240,
          background: 'var(--color-surface)',
          borderLeft: '1px solid var(--color-border)',
          padding: '2rem',
          display: 'flex', flexDirection: 'column', gap: '1rem',
          zIndex: 100,
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.25s cubic-bezier(0.16,1,0.3,1)',
        }}
        aria-hidden={!open}
      >
        {links.map(l => (
          <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--fs-h5)',
              fontWeight: 600,
              color: 'var(--color-text)',
              padding: '0.5rem 0',
              textDecoration: 'none',
            }}
          >
            {l.label}
          </Link>
        ))}
        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '0.5rem 0' }} />
        <button
          onClick={() => {
            const added = document.documentElement.classList.toggle('dark')
            localStorage.setItem('theme', added ? 'dark' : 'light')
            setDrawerTick(n => n + 1)
          }}
          style={{
            background: 'none',
            border: 'none',
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--fs-base)',
            fontWeight: 500,
            color: 'var(--color-text-secondary)',
            padding: '0.5rem 0',
            cursor: 'pointer',
            textAlign: 'left',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <span style={{ fontSize: 'var(--fs-h5)', lineHeight: 1 }}>
            {document.documentElement.classList.contains('dark') ? '\u2600' : '\u263E'}
          </span>
          {document.documentElement.classList.contains('dark') ? 'Light mode' : 'Dark mode'}
        </button>
      </div>
    </>
  )
}
