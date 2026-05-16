import type { ReactNode } from 'react'
import { headers } from 'next/headers'
import Nav from '@/features/nav/nav'
import { ClientShell } from '@/features/shell/client-shell'
import './globals.css'

export const metadata = {
  title: 'Jasper Cordova | Portfolio',
  description: 'Software Engineer — Full Stack · AWS · DevOps',
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const nonce = (await headers()).get('x-nonce') || ''

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script nonce={nonce} dangerouslySetInnerHTML={{
          __html: `(function(){var t=localStorage.getItem('theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme:dark)').matches))document.documentElement.classList.add('dark')})()`
        }} />
      </head>
      <body>
        <ClientShell>
          <Nav />
          {children}
          <footer>
            <div className="container">&copy; {new Date().getFullYear()} — Built with Next.js + PostgREST + Supabase</div>
          </footer>
        </ClientShell>
      </body>
    </html>
  )
}
