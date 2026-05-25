'use client'

import { useState, useEffect, type FormEvent } from 'react'
import type { SiteConfig } from '@/lib/types'
import { get, patch } from '@/lib/api-client'
import styles from './admin.module.css'

export default function AdminConfig() {
  const [items, setItems] = useState<SiteConfig[]>([])
  const [editing, setEditing] = useState<SiteConfig | null>(null)
  const [editValue, setEditValue] = useState('')
  const [error, setError] = useState('')
  const [saved, setSaved] = useState('')

  useEffect(() => { get<SiteConfig[]>('/site_config?limit=100').then(setItems) }, [])

  function startEdit(c: SiteConfig) {
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
        <tbody>{items.map(c => (
          <tr key={c.key}><td className={styles.configKey}>{c.key}</td>
            <td className={styles.configValue}>{JSON.stringify(c.value).slice(0, 60)}</td>
            <td className={styles.actionCell}>
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
              <div className="form-group"><label htmlFor="config-value">Value (JSON)</label>
                <textarea id="config-value" value={editValue} onChange={e => setEditValue(e.target.value)} className={styles.configTextarea} /></div>
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
