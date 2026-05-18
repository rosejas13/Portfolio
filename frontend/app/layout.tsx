import type { ReactNode } from 'react'
import { headers } from 'next/headers'
import Link from 'next/link'
import { sora, onest } from '@/lib/design-tokens/fonts'
import Nav from '@/features/nav/nav'
import { ClientShell } from '@/features/shell/client-shell'
import { RoseIcon } from '@/lib/rose-icon'
import './globals.css'

export const metadata = {
  title: 'Jasper Cordova | Software Engineer',
  description: 'Software Engineer — Full Stack · AWS · DevOps',
  icons: {
    icon: '/favicon.svg?v=2',
    shortcut: '/favicon.svg',
  },
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const nonce = (await headers()).get('x-nonce') || ''

  return (
    <html lang="en" suppressHydrationWarning className={`${sora.variable} ${onest.variable}`}>
      <head>
        <meta name="color-scheme" content="light dark" />
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme:dark)').matches))document.documentElement.classList.add('dark')})()`,
          }}
        />
      </head>
      <body>
        <a href="#main-content" className="skip-link">Skip to content</a>
        <ClientShell>
          <Nav />
          <main id="main-content">{children}</main>
          <footer>
            <div className="container">
              <RoseIcon size={12} /> &copy; {new Date().getFullYear()} — Built with Next.js +
              PostgREST + Supabase
              <span className="footer-sep">|</span>
              <Link href="/privacy" className="footer-link">Privacy</Link>
            </div>
          </footer>
        </ClientShell>
      </body>
    </html>
  )
}
