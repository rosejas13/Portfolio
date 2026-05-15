import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ClientShell } from '../client-shell'

describe('ClientShell', () => {
  it('renders children', () => {
    render(<ClientShell><div>hello</div></ClientShell>)
    expect(screen.getByText('hello')).toBeInTheDocument()
  })
})
