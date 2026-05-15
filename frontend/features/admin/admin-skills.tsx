'use client'

import { useState, useEffect, type FormEvent } from 'react'
import { get, post, patch, del } from '@/lib/api-client'

export default function AdminSkills() {
  const [items, setItems] = useState<any[]>([])
  const [editing, setEditing] = useState<any | null>(null)
  const [error, setError] = useState('')

  useEffect(() => { get<any[]>('/skills').then(setItems) }, [])

  async function handleSave(e: FormEvent) {
    e.preventDefault(); setError('')
    try {
      if (editing?.id) { await patch(`/skills?id=eq.${editing.id}`, editing) }
      else { await post('/skills', editing!) }
      setEditing(null); setItems(await get('/skills'))
    } catch (err: unknown) { setError(String(err)) }
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete?')) return
    await del(`/skills?id=eq.${id}`); setItems(await get('/skills'))
  }

  const byCat: Record<string, any[]> = {}
  for (const s of items) { const c = s.category || 'Other'; if (!byCat[c]) byCat[c] = []; byCat[c].push(s) }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Skills</h1>
        <button className="btn btn-primary" onClick={() => setEditing({ name: '', category: '' })}>+ New</button>
      </div>
      {error && <div className="error">{error}</div>}
      {Object.entries(byCat).map(([cat, items]) => (
        <div key={cat} style={{ marginTop: 20 }}>
          <h2 style={{ fontSize: 14, color: '#888', textTransform: 'uppercase' }}>{cat}</h2>
          <table><tbody>{items.map(s => (
            <tr key={s.id}><td>{s.name}</td>
              <td style={{ textAlign: 'right' }}>
                <button className="btn btn-secondary btn-sm" onClick={() => setEditing(s)}>Edit</button>{' '}
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s.id)}>Del</button>
              </td>
            </tr>
          ))}</tbody></table>
        </div>
      ))}
      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{editing.id ? 'Edit' : 'New'} Skill</h2>
            <form onSubmit={handleSave}>
              <div className="form-group"><label>Name</label><input value={editing.name || ''} onChange={e => setEditing({...editing, name: e.target.value})} required /></div>
              <div className="form-group"><label>Category</label><input value={editing.category || ''} onChange={e => setEditing({...editing, category: e.target.value})} /></div>
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
