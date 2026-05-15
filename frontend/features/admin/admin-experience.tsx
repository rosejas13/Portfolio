'use client'

import { useState, useEffect, type FormEvent } from 'react'
import { get, post, patch, del } from '@/lib/api-client'

export default function AdminExperience() {
  const [items, setItems] = useState<any[]>([])
  const [editing, setEditing] = useState<any | null>(null)
  const [error, setError] = useState('')

  useEffect(() => { get<any[]>('/experiences').then(setItems) }, [])

  async function handleSave(e: FormEvent) {
    e.preventDefault(); setError('')
    try {
      if (editing?.id) { await patch(`/experiences?id=eq.${editing.id}`, editing) }
      else { await post('/experiences', editing!) }
      setEditing(null); setItems(await get('/experiences'))
    } catch (err: unknown) { setError(String(err)) }
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete?')) return
    await del(`/experiences?id=eq.${id}`); setItems(await get('/experiences'))
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h1>Experience</h1>
        <button className="btn btn-primary" onClick={() => setEditing({ company: '', role: '', start_date: '' })}>+ New</button>
      </div>
      {error && <div className="error">{error}</div>}
      {items.map((i: any) => (
        <div key={i.id} className="card" style={{ marginTop: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div><h3>{i.role}</h3><p style={{ color: '#4361ee' }}>{i.company}</p></div>
            <div style={{ textAlign: 'right' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setEditing(i)}>Edit</button>{' '}
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(i.id)}>Del</button>
            </div>
          </div>
          <p style={{ fontSize: 13, color: '#888', marginTop: 4 }}>{i.start_date} — {i.current ? 'Present' : i.end_date}</p>
        </div>
      ))}
      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{editing.id ? 'Edit' : 'New'} Experience</h2>
            <form onSubmit={handleSave}>
              <div className="form-group"><label>Company</label><input value={editing.company || ''} onChange={e => setEditing({...editing, company: e.target.value})} required /></div>
              <div className="form-group"><label>Role</label><input value={editing.role || ''} onChange={e => setEditing({...editing, role: e.target.value})} required /></div>
              <div className="form-group"><label>Start Date</label><input type="date" value={editing.start_date || ''} onChange={e => setEditing({...editing, start_date: e.target.value})} required /></div>
              <div className="form-group"><label>End Date</label><input type="date" value={editing.end_date || ''} onChange={e => setEditing({...editing, end_date: e.target.value})} /></div>
              <div className="form-group"><label><input type="checkbox" checked={editing.current || false} onChange={e => setEditing({...editing, current: e.target.checked, end_date: e.target.checked ? null : editing.end_date})} /> Current</label></div>
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
