'use client'

import type { Education } from '@/lib/types'
import { useCrud } from '@/lib/use-crud'
import styles from './admin.module.css'

export default function AdminEducation() {
  const { items, editing, setEditing, error, handleSave, handleDelete } = useCrud<Education>('education')

  return (
    <div>
      <div className={styles.crudHeader}>
        <h1>Education</h1>
        <button className="btn btn-primary" onClick={() => setEditing({ school: '' })}>+ New</button>
      </div>
      {error && <div className="error">{error}</div>}
      {items.map(i => (
        <div key={i.id} className={`card ${styles.cardItem}`}>
          <div className={styles.cardContent}>
            <div><h3 className={styles.cardTitle}>{i.school}</h3><p className="text-secondary">{[i.degree, i.field].filter(Boolean).join(' in ')}</p></div>
            <div className={styles.cardActions}>
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
