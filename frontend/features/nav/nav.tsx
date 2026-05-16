import Link from 'next/link'
import { ThemeToggle, MobileMenu } from './nav-actions'

export default function Nav() {
  return (
    <nav className="container">
      <Link href="/" className="logo">Jasper Cordova</Link>
      <div className="nav-links">
        <Link href="/">Home</Link>
        <Link href="/about">About</Link>
        <Link href="/projects">Projects</Link>
        <Link href="/blog">Blog</Link>
        <Link href="/contact">Contact</Link>
      </div>
      <div className="nav-actions">
        <ThemeToggle />
        <MobileMenu />
      </div>
    </nav>
  )
}
