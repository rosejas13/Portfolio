'use client'

import { useState, useEffect, type FormEvent } from 'react'
import { get, post, patch, del } from '@/lib/api-client'

export default function AdminEducation() {
  const [items, setItems] = useState<any[]>([])
  const [editing, setEditing] = useState<any | null>(null)
  const [error, setError] = useState('')

  useEffect(() => { get<any[]>('/education').then(setItems) }, [])

  async function handleSave(e: FormEvent) {
    e.preventDefault(); setError('')
    try {
      if (editing?.id) { await patch(`/education?id=eq.${editing.id}`, editing) }
      else { await post('/education', editing!) }
      setEditing(null); setItems(await get('/education'))
    } catch (err: unknown) { setError(String(err)) }
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete?')) return
    await del(`/education?id=eq.${id}`); setItems(await get('/education'))
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h1>Education</h1>
        <button className="btn btn-primary" onClick={() => setEditing({ school: '' })}>+ New</button>
      </div>
      {error && <div className="error">{error}</div>}
      {items.map((i: any) => (
        <div key={i.id} className="card" style={{ marginTop: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div><h3>{i.school}</h3><p style={{ color: '#666' }}>{[i.degree, i.field].filter(Boolean).join(' in ')}</p></div>
            <div style={{ textAlign: 'right' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setEditing(i)}>Edit</button>{' '}
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(i.id)}>Del</button>
            </div>
          </div>
        </div>
      ))}
      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{editing.id ? 'Edit' : 'New'} Education</h2>
            <form onSubmit={handleSave}>
              <div className="form-group"><label>School</label><input value={editing.school || ''} onChange={e => setEditing({...editing, school: e.target.value})} required /></div>
              <div className="form-group"><label>Degree</label><input value={editing.degree || ''} onChange={e => setEditing({...editing, degree: e.target.value})} /></div>
              <div className="form-group"><label>Field</label><input value={editing.field || ''} onChange={e => setEditing({...editing, field: e.target.value})} /></div>
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
