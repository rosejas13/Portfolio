'use client'

import { useState, useEffect } from 'react'
import type { Lead } from '@/lib/types'
import { get, patch, del } from '@/lib/api-client'
import styles from './admin.module.css'

export default function AdminLeads() {
  const [items, setItems] = useState<Lead[]>([])

  useEffect(() => { get<Lead[]>('/leads?order=created_at.desc&limit=100').then(setItems) }, [])

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
      <table className={styles.tableWrap}>
        <thead><tr><th>Name</th><th>Email</th><th>Message</th><th>Status</th><th></th></tr></thead>
        <tbody>{items.map(l => (
          <tr key={l.id}>
            <td>{l.name}</td><td>{l.email}</td>
            <td className={styles.leadMessage}>{l.message}</td>
            <td><select value={l.status} onChange={e => handleStatus(l.id, e.target.value)} className={styles.leadStatusSelect}>
              <option value="new">New</option><option value="read">Read</option><option value="replied">Replied</option><option value="archived">Archived</option></select></td>
            <td className={styles.actionCell}>
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(l.id)}>Del</button>
            </td>
          </tr>
        ))}</tbody>
      </table>
      {items.length === 0 && <p className={styles.empty}>No leads yet.</p>}
    </div>
  )
}
