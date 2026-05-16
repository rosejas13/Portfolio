'use client'

import type { Skill } from '@/lib/types'
import { useCrud } from '@/lib/use-crud'
import styles from './admin.module.css'

export default function AdminSkills() {
  const { items, editing, setEditing, error, handleSave, handleDelete } = useCrud<Skill>('skills')

  const byCat: Record<string, Skill[]> = {}
  for (const s of items) {
    const c = s.category || 'Other'
    if (!byCat[c]) byCat[c] = []
    byCat[c].push(s)
  }

  return (
    <div>
      <div className={styles.crudHeader}>
        <h1>Skills</h1>
        <button className="btn btn-primary" onClick={() => setEditing({ name: '', category: '' })}>+ New</button>
      </div>
      {error && <div className="error">{error}</div>}
      {Object.entries(byCat).map(([cat, items]) => (
        <div key={cat} className={styles.skillCategory}>
          <h2 className={styles.skillCategoryTitle}>{cat}</h2>
          <table><tbody>{items.map(s => (
            <tr key={s.id}><td>{s.name}</td>
              <td className={styles.actionCell}>
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
