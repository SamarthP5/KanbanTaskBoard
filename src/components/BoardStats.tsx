import { CheckCircle2, Circle, Clock, AlertCircle } from 'lucide-react'
import { isPast, isToday, parseISO } from 'date-fns'
import type { Task } from '../types'

interface Props {
  tasks: Task[]
}

export function BoardStats({ tasks }: Props) {
  const total = tasks.length
  const done = tasks.filter(t => t.status === 'done').length
  const overdue = tasks.filter(t =>
    t.due_date && t.status !== 'done' && isPast(parseISO(t.due_date)) && !isToday(parseISO(t.due_date))
  ).length
  const inProgress = tasks.filter(t => t.status === 'in_progress').length

  const stats = [
    { icon: <Circle size={14} />, label: 'Total', value: total, color: '#6b7280' },
    { icon: <Clock size={14} />, label: 'In Progress', value: inProgress, color: '#f59e0b' },
    { icon: <CheckCircle2 size={14} />, label: 'Done', value: done, color: '#22c55e' },
    { icon: <AlertCircle size={14} />, label: 'Overdue', value: overdue, color: overdue > 0 ? '#ef4444' : '#6b7280' },
  ]

  return (
    <div className="board-stats">
      {stats.map(s => (
        <div key={s.label} className="stat-chip" style={{ '--stat-color': s.color } as React.CSSProperties}>
          <span className="stat-icon">{s.icon}</span>
          <span className="stat-value">{s.value}</span>
          <span className="stat-label">{s.label}</span>
        </div>
      ))}
    </div>
  )
}
