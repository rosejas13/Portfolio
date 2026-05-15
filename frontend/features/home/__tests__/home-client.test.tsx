import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import HomeClient from '../home-client'

const mockPosts = [
  { id: 1, title: 'Post One', slug: 'post-one', excerpt: 'First post', created_at: '2026-01-15T00:00:00Z' },
  { id: 2, title: 'Post Two', slug: 'post-two', excerpt: null, created_at: '2026-02-20T00:00:00Z' },
]

describe('HomeClient', () => {
  it('renders post titles as links', () => {
    render(<HomeClient posts={mockPosts} />)
    expect(screen.getByText('Post One')).toBeInTheDocument()
    expect(screen.getByText('Post Two')).toBeInTheDocument()
  })

  it('links to the correct blog URLs', () => {
    render(<HomeClient posts={mockPosts} />)
    const links = screen.getAllByRole('link')
    expect(links[0]).toHaveAttribute('href', '/blog/post-one')
    expect(links[1]).toHaveAttribute('href', '/blog/post-two')
  })

  it('renders excerpt when available', () => {
    render(<HomeClient posts={mockPosts} />)
    expect(screen.getByText('First post')).toBeInTheDocument()
  })

  it('renders formatted dates', () => {
    render(<HomeClient posts={mockPosts} />)
    const dates = screen.getAllByText(/2026/)
    expect(dates).toHaveLength(2)
  })
})
