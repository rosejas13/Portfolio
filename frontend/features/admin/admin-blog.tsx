'use client'

import { useState, useEffect, type FormEvent } from 'react'
import { get, post, patch, del } from '@/lib/api-client'

export default function AdminBlog() {
  const [items, setItems] = useState<any[]>([])
  const [editing, setEditing] = useState<any | null>(null)
  const [error, setError] = useState('')

  useEffect(() => { get<any[]>('/posts').then(setItems) }, [])

  async function handleSave(e: FormEvent) {
    e.preventDefault(); setError('')
    try {
      if (editing?.id) { await patch(`/posts?id=eq.${editing.id}`, editing) }
      else { await post('/posts', editing!) }
      setEditing(null); setItems(await get('/posts'))
    } catch (err: unknown) { setError(String(err)) }
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete?')) return
    await del(`/posts?id=eq.${id}`); setItems(await get('/posts'))
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h1>Blog Posts</h1>
        <button className="btn btn-primary" onClick={() => setEditing({ title: '', slug: '', status: 'draft' })}>+ New</button>
      </div>
      {error && <div className="error">{error}</div>}
      <table style={{ marginTop: 16 }}>
        <thead><tr><th>Title</th><th>Status</th><th></th></tr></thead>
        <tbody>{items.map((p: any) => (
          <tr key={p.id}><td>{p.title}</td><td>{p.status}</td>
            <td style={{ textAlign: 'right' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setEditing(p)}>Edit</button>{' '}
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}>Del</button>
            </td>
          </tr>
        ))}</tbody>
      </table>
      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{editing.id ? 'Edit' : 'New'} Post</h2>
            <form onSubmit={handleSave}>
              <div className="form-group"><label>Title</label><input value={editing.title || ''} onChange={e => setEditing({...editing, title: e.target.value})} required /></div>
              <div className="form-group"><label>Slug</label><input value={editing.slug || ''} onChange={e => setEditing({...editing, slug: e.target.value})} required /></div>
              <div className="form-group"><label>Content</label><textarea value={editing.content || ''} onChange={e => setEditing({...editing, content: e.target.value})} /></div>
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
