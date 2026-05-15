import Link from 'next/link'
import ThemeToggle from './theme-toggle'

export default function Nav() {
  return (
    <nav className="container">
      <Link href="/" className="logo">Jasper Cordova</Link>
      <Link href="/">Home</Link>
      <Link href="/about">About</Link>
      <Link href="/projects">Projects</Link>
      <Link href="/blog">Blog</Link>
      <Link href="/contact">Contact</Link>
      <ThemeToggle />
    </nav>
  )
}
