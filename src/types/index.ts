export type Status = 'todo' | 'in_progress' | 'in_review' | 'done'
export type Priority = 'low' | 'normal' | 'high'

export interface Task {
  id: string
  title: string
  description: string | null
  status: Status
  priority: Priority
  due_date: string | null
  assignee_id: string | null
  user_id: string
  created_at: string
}

export interface Column {
  id: Status
  label: string
  color: string
  accent: string
}

export const COLUMNS: Column[] = [
  { id: 'todo',        label: 'To Do',      color: '#3b82f6', accent: 'rgba(59,130,246,0.15)' },
  { id: 'in_progress', label: 'In Progress', color: '#f59e0b', accent: 'rgba(245,158,11,0.15)' },
  { id: 'in_review',   label: 'In Review',  color: '#a855f7', accent: 'rgba(168,85,247,0.15)' },
  { id: 'done',        label: 'Done',       color: '#22c55e', accent: 'rgba(34,197,94,0.15)'  },
]

export const PRIORITY_CONFIG = {
  low:    { label: 'Low',    color: '#6b7280' },
  normal: { label: 'Normal', color: '#3b82f6' },
  high:   { label: 'High',   color: '#ef4444' },
}
