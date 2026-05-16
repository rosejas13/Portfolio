'use client'

import { Component, type ReactNode } from 'react'
import styles from './shell.module.css'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  errorId: string | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, errorId: null }

  static getDerivedStateFromError(): State {
    return { hasError: true, errorId: null }
  }

  async componentDidCatch(error: Error, info: { componentStack: string }) {
    const errorId = crypto.randomUUID()
    this.setState({ errorId })

    try {
      await fetch('/api/error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          errorId,
          message: error.message,
          name: error.name,
          component: info.componentStack?.split('\n')[1]?.trim()?.split(' ')[0] || 'unknown',
          url: window.location.pathname,
          timestamp: new Date().toISOString(),
        }),
      })
    } catch {
      // Fail silently
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className={styles.errorWrap}>
          <h2>Something went wrong</h2>
          <p className={styles.errorText}>
            The error has been logged. Please try refreshing the page.
          </p>
          {this.state.errorId && (
            <p className={styles.errorRef}>
              Reference: {this.state.errorId}
            </p>
          )}
          <button
            className={`btn btn-primary ${styles.refreshBtn}`}
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
