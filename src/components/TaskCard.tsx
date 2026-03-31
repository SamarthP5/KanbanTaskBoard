import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Calendar, Flag, GripVertical } from 'lucide-react'
import { format, isPast, isToday, parseISO } from 'date-fns'
import type { Task } from '../types'
import { PRIORITY_CONFIG } from '../types'
import type { TeamMember } from '../hooks/useTeamMembers'

interface Props {
  task: Task
  onClick: () => void
  members?: TeamMember[]
}

export function TaskCard({ task, onClick, members = [] }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  const dueDateStatus = (() => {
    if (!task.due_date) return null
    const date = parseISO(task.due_date)
    if (task.status === 'done') return { color: '#6b7280', label: format(date, 'MMM d') }
    if (isPast(date) && !isToday(date)) return { color: '#ef4444', label: format(date, 'MMM d') + ' · Overdue' }
    if (isToday(date)) return { color: '#f59e0b', label: 'Due today' }
    return { color: '#6b7280', label: format(date, 'MMM d') }
  })()

  const priority = PRIORITY_CONFIG[task.priority]
  const assignee = members.find(m => m.id === task.assignee_id)

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="task-card"
      onClick={onClick}
    >
      <div className="task-card-drag" {...attributes} {...listeners} onClick={e => e.stopPropagation()}>
        <GripVertical size={14} />
      </div>

      <div className="task-card-body">
        <p className="task-title">{task.title}</p>
        {task.description && (
          <p className="task-desc">{task.description}</p>
        )}
        <div className="task-meta">
          <span className="task-priority" style={{ color: priority.color }}>
            <Flag size={11} />
            {priority.label}
          </span>
          {dueDateStatus && (
            <span className="task-due" style={{ color: dueDateStatus.color }}>
              <Calendar size={11} />
              {dueDateStatus.label}
            </span>
          )}
          {assignee && (
            <span className="task-assignee">
              <span className="avatar avatar-sm" style={{ background: assignee.color }}>
                {assignee.name.charAt(0).toUpperCase()}
              </span>
              {assignee.name}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
