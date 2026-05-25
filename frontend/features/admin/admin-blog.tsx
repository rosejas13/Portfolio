'use client'

import type { Post } from '@/lib/types'
import { useCrud } from '@/lib/use-crud'
import styles from './admin.module.css'

export default function AdminBlog() {
  const { items, editing, setEditing, error, handleSave, handleDelete } = useCrud<Post>('posts')

  return (
    <div>
      <div className={styles.crudHeader}>
        <h1>Blog Posts</h1>
        <button className="btn btn-primary" onClick={() => setEditing({ title: '', slug: '', status: 'draft' })}>+ New</button>
      </div>
      {error && <div className="error">{error}</div>}
      <table className={styles.tableWrap}>
        <thead><tr><th>Title</th><th>Status</th><th></th></tr></thead>
        <tbody>{items.map(p => (
          <tr key={p.id}><td>{p.title}</td><td>{p.status}</td>
            <td className={styles.actionCell}>
              <button className="btn btn-secondary btn-sm" onClick={() => setEditing(p)}>Edit</button>{' '}
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}>Del</button>
            </td>
          </tr>
        ))}</tbody>
      </table>
      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{editing.id ? 'Edit' : 'New'} Post</h2>
            <form onSubmit={handleSave}>
              <div className="form-group"><label htmlFor="post-title">Title</label><input id="post-title" value={editing.title || ''} onChange={e => setEditing({...editing, title: e.target.value})} required /></div>
              <div className="form-group"><label htmlFor="post-slug">Slug</label><input id="post-slug" value={editing.slug || ''} onChange={e => setEditing({...editing, slug: e.target.value})} required /></div>
              <div className="form-group"><label htmlFor="post-content">Content</label><textarea id="post-content" value={editing.content || ''} onChange={e => setEditing({...editing, content: e.target.value})} /></div>
              <div className="form-group"><label htmlFor="post-status">Status</label><select id="post-status" value={editing.status || 'draft'} onChange={e => setEditing({...editing, status: e.target.value})}>
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
