'use client'

import { ThemeProvider } from '@azimuth/ui'
import { ErrorBoundary } from './error-boundary'
import type { ReactNode } from 'react'

export function ClientShell({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      config={{
        accentColor: 'oklch(65% 0.16 35)',
        borderRadius: 'md',
        spacing: 'normal',
        motion: 'snappy',
        fontDisplay: "'Sora', system-ui, sans-serif",
        fontBody: "'Onest', system-ui, sans-serif",
        mode: 'system',
      }}
    >
      <ErrorBoundary>{children}</ErrorBoundary>
    </ThemeProvider>
  )
}
