import type { ReactNode } from 'react'
import { headers } from 'next/headers'
import { sora, onest } from '@/lib/design-tokens/fonts'
import Nav from '@/features/nav/nav'
import Footer from '@/features/shell/footer'
import { ClientShell } from '@/features/shell/client-shell'
import 'azimuth-ui/styles.css'
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
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <ClientShell>
          <header><Nav /></header>
          <main id="main-content">{children}</main>
          <Footer />
        </ClientShell>
      </body>
    </html>
  )
}
