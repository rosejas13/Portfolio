import Link from 'next/link'
import { RoseIcon } from '@/lib/rose-icon'
import { ThemeToggle, MobileMenu } from './nav-actions'

export default function Nav() {
  return (
    <nav className="container" aria-label="Main">
      <Link href="/" className="logo">
        <RoseIcon size={32} color="#149086" /> Jasper Cordova
      </Link>
      <div className="nav-links">
        <Link href="/">Home</Link>
        <Link href="/about">About</Link>
        <Link href="/services">Services</Link>
        <Link href="/projects">Projects</Link>
        <Link href="/blog">Blog</Link>
        <Link href="/resume">Resume</Link>
        <Link href="/contact">Contact</Link>
      </div>
      <div className="nav-actions">
        <ThemeToggle />
        <MobileMenu />
      </div>
    </nav>
  )
}
