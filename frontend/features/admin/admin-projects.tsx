'use client'

import { useState, useEffect, type FormEvent } from 'react'
import { get, post, patch, del } from '@/lib/api-client'

export default function AdminProjects() {
  type Project = { id: number; title: string; slug: string; tagline: string | null; description: string | null; status: string; sort_order: number }
  const [items, setItems] = useState<Project[]>([])
  const [editing, setEditing] = useState<Partial<Project> | null>(null)
  const [error, setError] = useState('')

  useEffect(() => { get<Project[]>('/projects').then(setItems) }, [])

  async function handleSave(e: FormEvent) {
    e.preventDefault(); setError('')
    try {
      if (editing?.id) { await patch(`/projects?id=eq.${editing.id}`, editing) }
      else { await post('/projects', editing!) }
      setEditing(null); setItems(await get('/projects'))
    } catch (err: unknown) { setError(String(err)) }
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete?')) return
    await del(`/projects?id=eq.${id}`); setItems(await get('/projects'))
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Projects</h1>
        <button className="btn btn-primary" onClick={() => setEditing({ title: '', slug: '', status: 'draft' })}>+ New</button>
      </div>
      {error && <div className="error">{error}</div>}
      <table style={{ marginTop: 16 }}>
        <thead><tr><th>Title</th><th>Status</th><th></th></tr></thead>
        <tbody>{items.map(i => (
          <tr key={i.id}><td>{i.title}</td><td>{i.status}</td>
            <td style={{ textAlign: 'right' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setEditing(i)}>Edit</button>{' '}
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(i.id)}>Del</button>
            </td>
          </tr>
        ))}</tbody>
      </table>
      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{editing.id ? 'Edit' : 'New'} Project</h2>
            <form onSubmit={handleSave}>
              <div className="form-group"><label>Title</label><input value={editing.title || ''} onChange={e => setEditing({...editing, title: e.target.value})} required /></div>
              <div className="form-group"><label>Slug</label><input value={editing.slug || ''} onChange={e => setEditing({...editing, slug: e.target.value})} required /></div>
              <div className="form-group"><label>Tagline</label><input value={editing.tagline || ''} onChange={e => setEditing({...editing, tagline: e.target.value})} /></div>
              <div className="form-group"><label>Status</label><select value={editing.status || 'draft'} onChange={e => setEditing({...editing, status: e.target.value})}>
                <option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setEditing(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
