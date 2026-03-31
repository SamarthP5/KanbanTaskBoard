import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Task, Status, Priority } from '../types'

export function useTasks(userId: string | undefined) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTasks = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })

    if (err) {
      setError(err.message)
    } else {
      setTasks(data as Task[])
    }
    setLoading(false)
  }, [userId])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const createTask = async (fields: {
    title: string
    description?: string
    priority: Priority
    due_date?: string
    status?: Status
    assignee_id?: string
  }) => {
    if (!userId) return
    const { data, error: err } = await supabase
      .from('tasks')
      .insert({
        title: fields.title,
        description: fields.description || null,
        priority: fields.priority,
        due_date: fields.due_date || null,
        status: fields.status ?? 'todo',
        assignee_id: fields.assignee_id || null,
        user_id: userId,
      })
      .select()
      .single()

    if (!err && data) {
      setTasks(prev => [...prev, data as Task])
    }
    return { error: err }
  }

  const updateTaskStatus = async (id: string, status: Status) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t))
    const { error: err } = await supabase
      .from('tasks')
      .update({ status })
      .eq('id', id)
    if (err) {
      // Revert on failure
      fetchTasks()
    }
  }

  const updateTask = async (id: string, fields: Partial<Pick<Task, 'title' | 'description' | 'priority' | 'due_date' | 'assignee_id'>>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...fields } : t))
    const { error: err } = await supabase
      .from('tasks')
      .update(fields)
      .eq('id', id)
    if (err) fetchTasks()
  }

  const deleteTask = async (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id))
    await supabase.from('tasks').delete().eq('id', id)
  }

  return { tasks, loading, error, createTask, updateTaskStatus, updateTask, deleteTask, refetch: fetchTasks }
}
