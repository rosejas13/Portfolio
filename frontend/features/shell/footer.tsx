import Link from 'next/link'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="footer section">
      <div className="container">
        <div className="footer-inner">
          <p>&copy; {year} Jasper Cordova. All rights reserved.</p>
          <nav aria-label="Footer navigation">
            <Link href="/privacy">Privacy</Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
