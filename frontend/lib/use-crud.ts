'use client'

import { useState, useEffect, type FormEvent } from 'react'
import { get, post, patch, del } from '@/lib/api-client'

export function useCrud<T extends { id: number }>(endpoint: string) {
  const [items, setItems] = useState<T[]>([])
  const [editing, setEditing] = useState<Partial<T> | null>(null)
  const [error, setError] = useState('')

  const refresh = () => get<T[]>(`/${endpoint}?limit=200`).then(setItems)

  useEffect(() => { refresh() }, [endpoint])

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    setError('')
    try {
      if (editing?.id) {
        await patch(`/${endpoint}?id=eq.${editing.id}`, editing)
      } else {
        await post(`/${endpoint}`, editing!)
      }
      setEditing(null)
      await refresh()
    } catch (err: unknown) {
      setError(String(err))
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete?')) return
    try {
      await del(`/${endpoint}?id=eq.${id}`)
      await refresh()
    } catch (err: unknown) {
      setError(String(err))
    }
  }

  return { items, setItems, editing, setEditing, error, setError, handleSave, handleDelete }
}
