import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Nav from '../nav'

vi.mock('../nav-actions', () => ({
  ThemeToggle: () => <button data-testid="theme-toggle">Toggle</button>,
  MobileMenu: () => <div data-testid="mobile-menu" />,
}))

describe('Nav', () => {
  it('renders the logo', () => {
    render(<Nav />)
    expect(screen.getByText('Jasper Cordova')).toBeInTheDocument()
  })

  it('renders all navigation links', () => {
    render(<Nav />)
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('About')).toBeInTheDocument()
    expect(screen.getByText('Projects')).toBeInTheDocument()
    expect(screen.getByText('Blog')).toBeInTheDocument()
    expect(screen.getByText('Contact')).toBeInTheDocument()
  })

  it('renders the theme toggle', () => {
    render(<Nav />)
    expect(screen.getByTestId('theme-toggle')).toBeInTheDocument()
  })
})
