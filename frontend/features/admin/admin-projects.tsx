'use client'

import type { Project } from '@/lib/types'
import { useCrud } from '@/lib/use-crud'
import styles from './admin.module.css'

export default function AdminProjects() {
  const { items, editing, setEditing, error, handleSave, handleDelete } = useCrud<Project>('projects')

  return (
    <div>
      <div className={styles.crudHeader}>
        <h1>Projects</h1>
        <button className="btn btn-primary" onClick={() => setEditing({ title: '', slug: '', status: 'draft' })}>+ New</button>
      </div>
      {error && <div className="error">{error}</div>}
      <table className={styles.tableWrap}>
        <thead><tr><th>Title</th><th>Status</th><th></th></tr></thead>
        <tbody>{items.map(i => (
          <tr key={i.id}><td>{i.title}</td><td>{i.status}</td>
            <td className={styles.actionCell}>
              <button className="btn btn-secondary btn-sm" onClick={() => setEditing(i)}>Edit</button>{' '}
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(i.id)}>Del</button>
            </td>
          </tr>
        ))}</tbody>
      </table>
      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{editing.id ? 'Edit' : 'New'} Project</h2>
            <form onSubmit={handleSave}>
              <div className="form-group"><label>Title</label><input value={editing.title || ''} onChange={e => setEditing({...editing, title: e.target.value})} required /></div>
              <div className="form-group"><label>Slug</label><input value={editing.slug || ''} onChange={e => setEditing({...editing, slug: e.target.value})} required /></div>
              <div className="form-group"><label>Tagline</label><input value={editing.tagline || ''} onChange={e => setEditing({...editing, tagline: e.target.value})} /></div>
              <div className="form-group"><label>Status</label><select value={editing.status || 'draft'} onChange={e => setEditing({...editing, status: e.target.value})}>
                <option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></div>
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
