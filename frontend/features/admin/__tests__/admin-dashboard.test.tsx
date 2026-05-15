import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import AdminDashboard from '../admin-dashboard'

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('AdminDashboard', () => {
  it('renders stats after fetching data', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify([{ id: 1 }, { id: 2 }, { id: 3 }]), { headers: { 'content-type': 'application/json' } }))
      .mockResolvedValueOnce(new Response(JSON.stringify([{ id: 1 }]), { headers: { 'content-type': 'application/json' } }))
      .mockResolvedValueOnce(new Response(JSON.stringify([{ id: 1 }, { id: 2 }]), { headers: { 'content-type': 'application/json' } }))
      .mockResolvedValueOnce(new Response(JSON.stringify([{ id: 1 }]), { headers: { 'content-type': 'application/json' } }))
    vi.stubGlobal('fetch', fetchMock)

    render(<AdminDashboard />)

    await waitFor(() => {
      expect(screen.getByText('3')).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument()
    })
  })

  it('displays zero stats when API returns empty', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify([]), { headers: { 'content-type': 'application/json' } }))
      .mockResolvedValueOnce(new Response(JSON.stringify([]), { headers: { 'content-type': 'application/json' } }))
      .mockResolvedValueOnce(new Response(JSON.stringify([]), { headers: { 'content-type': 'application/json' } }))
      .mockResolvedValueOnce(new Response(JSON.stringify([]), { headers: { 'content-type': 'application/json' } }))
    )

    render(<AdminDashboard />)

    await waitFor(() => {
      expect(screen.getByText('projects')).toBeInTheDocument()
      expect(screen.getByText('skills')).toBeInTheDocument()
      expect(screen.getByText('posts')).toBeInTheDocument()
      expect(screen.getByText('leads')).toBeInTheDocument()
    })
  })
})
