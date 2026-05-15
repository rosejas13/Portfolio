'use client'

import { useState, useEffect } from 'react'
import { get, patch, del } from '@/lib/api-client'

export default function AdminLeads() {
  const [items, setItems] = useState<any[]>([])

  useEffect(() => { get<any[]>('/leads?order=created_at.desc').then(setItems) }, [])

  async function handleStatus(id: number, status: string) {
    await patch(`/leads?id=eq.${id}`, { status })
    setItems(await get('/leads?order=created_at.desc'))
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete?')) return
    await del(`/leads?id=eq.${id}`)
    setItems(await get('/leads?order=created_at.desc'))
  }

  return (
    <div>
      <h1>Leads</h1>
      <table style={{ marginTop: 16 }}>
        <thead><tr><th>Name</th><th>Email</th><th>Message</th><th>Status</th><th></th></tr></thead>
        <tbody>{items.map((l: any) => (
          <tr key={l.id}>
            <td>{l.name}</td><td>{l.email}</td>
            <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.message}</td>
            <td><select value={l.status} onChange={e => handleStatus(l.id, e.target.value)} style={{ width: 'auto', fontSize: 12, padding: '2px 6px' }}>
              <option value="new">New</option><option value="read">Read</option><option value="replied">Replied</option><option value="archived">Archived</option></select></td>
            <td style={{ textAlign: 'right' }}>
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(l.id)}>Del</button>
            </td>
          </tr>
        ))}</tbody>
      </table>
      {items.length === 0 && <p style={{ color: '#888', marginTop: 20 }}>No leads yet.</p>}
    </div>
  )
}
