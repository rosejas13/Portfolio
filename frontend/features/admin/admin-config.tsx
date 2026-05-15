'use client'

import { useState, useEffect, type FormEvent } from 'react'
import { get, patch } from '@/lib/api-client'

export default function AdminConfig() {
  const [items, setItems] = useState<any[]>([])
  const [editing, setEditing] = useState<any | null>(null)
  const [editValue, setEditValue] = useState('')
  const [error, setError] = useState('')
  const [saved, setSaved] = useState('')

  useEffect(() => { get<any[]>('/site_config').then(setItems) }, [])

  function startEdit(c: any) {
    setEditing(c)
    setEditValue(typeof c.value === 'string' ? c.value : JSON.stringify(c.value, null, 2))
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault(); setError(''); setSaved('')
    try {
      await patch(`/site_config?key=eq.${editing!.key}`, { value: JSON.parse(editValue) })
      setSaved('Saved!'); setEditing(null); setItems(await get('/site_config'))
    } catch (err: unknown) { setError(String(err)) }
  }

  return (
    <div>
      <h1>Site Config</h1>
      {error && <div className="error">{error}</div>}
      {saved && <div className="success">{saved}</div>}
      <table>
        <thead><tr><th>Key</th><th>Value</th><th></th></tr></thead>
        <tbody>{items.map((c: any) => (
          <tr key={c.key}><td style={{ fontWeight: 600 }}>{c.key}</td>
            <td style={{ fontFamily: 'monospace', fontSize: 13 }}>{JSON.stringify(c.value).slice(0, 60)}</td>
            <td style={{ textAlign: 'right' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => startEdit(c)}>Edit</button>
            </td>
          </tr>
        ))}</tbody>
      </table>
      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Edit: {editing.key}</h2>
            <form onSubmit={handleSave}>
              <div className="form-group"><label>Value (JSON)</label>
                <textarea value={editValue} onChange={e => setEditValue(e.target.value)} style={{ minHeight: 80, fontFamily: 'monospace' }} /></div>
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
