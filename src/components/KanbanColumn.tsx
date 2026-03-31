import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus } from 'lucide-react'
import type { Task, Column } from '../types'
import { TaskCard } from './TaskCard'
import type { TeamMember } from '../hooks/useTeamMembers'

interface Props {
  column: Column
  tasks: Task[]
  onAddTask: () => void
  onTaskClick: (task: Task) => void
  members?: TeamMember[]
}

export function KanbanColumn({ column, tasks, onAddTask, onTaskClick, members = [] }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id })

  return (
    <div className="column" style={{ '--col-color': column.color, '--col-accent': column.accent } as React.CSSProperties}>
      <div className="column-header">
        <div className="column-title-row">
          <span className="column-dot" />
          <span className="column-label">{column.label}</span>
          <span className="column-count">{tasks.length}</span>
        </div>
        <button className="column-add-btn" onClick={onAddTask} title="Add task">
          <Plus size={15} />
        </button>
      </div>

      <div
        ref={setNodeRef}
        className={`column-body ${isOver ? 'drop-over' : ''}`}
      >
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} members={members} />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="column-empty">
            <span>Drop tasks here</span>
          </div>
        )}
      </div>
    </div>
  )
}
