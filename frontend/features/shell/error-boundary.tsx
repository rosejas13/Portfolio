'use client'

import { Component, type ReactNode } from 'react'

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
        <div style={{ padding: 40, textAlign: 'center' }}>
          <h2>Something went wrong</h2>
          <p style={{ color: '#666' }}>
            The error has been logged. Please try refreshing the page.
          </p>
          {this.state.errorId && (
            <p style={{ fontSize: 12, color: '#999', marginTop: 8 }}>
              Reference: {this.state.errorId}
            </p>
          )}
          <button
            className="btn btn-primary"
            style={{ marginTop: 16 }}
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
