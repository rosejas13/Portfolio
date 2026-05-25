'use client'

import type { Experience } from '@/lib/types'
import { useCrud } from '@/lib/use-crud'
import styles from './admin.module.css'

export default function AdminExperience() {
  const { items, editing, setEditing, error, handleSave, handleDelete } = useCrud<Experience>('experiences')

  return (
    <div>
      <div className={styles.crudHeader}>
        <h1>Experience</h1>
        <button className="btn btn-primary" onClick={() => setEditing({ company: '', role: '', start_date: '' })}>+ New</button>
      </div>
      {error && <div className="error">{error}</div>}
      {items.map(i => (
        <div key={i.id} className={`card ${styles.cardItem}`}>
          <div className={styles.cardContent}>
            <div><h3 className={styles.cardTitle}>{i.role}</h3><p className="text-primary">{i.company}</p></div>
            <div className={styles.cardActions}>
              <button className="btn btn-secondary btn-sm" onClick={() => setEditing(i)}>Edit</button>{' '}
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(i.id)}>Del</button>
            </div>
          </div>
          <p className="text-muted fs-13 mt-4">{i.start_date} — {i.current ? 'Present' : i.end_date}</p>
        </div>
      ))}
      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{editing.id ? 'Edit' : 'New'} Experience</h2>
            <form onSubmit={handleSave}>
              <div className="form-group"><label htmlFor="exp-company">Company</label><input id="exp-company" value={editing.company || ''} onChange={e => setEditing({...editing, company: e.target.value})} required /></div>
              <div className="form-group"><label htmlFor="exp-role">Role</label><input id="exp-role" value={editing.role || ''} onChange={e => setEditing({...editing, role: e.target.value})} required /></div>
              <div className="form-group"><label htmlFor="exp-start">Start Date</label><input id="exp-start" type="date" value={editing.start_date || ''} onChange={e => setEditing({...editing, start_date: e.target.value})} required /></div>
              <div className="form-group"><label htmlFor="exp-end">End Date</label><input id="exp-end" type="date" value={editing.end_date || ''} onChange={e => setEditing({...editing, end_date: e.target.value})} /></div>
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
