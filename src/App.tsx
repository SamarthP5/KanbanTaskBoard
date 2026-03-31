import { useState, useMemo } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core'
import { Search, Plus, Loader2, Users } from 'lucide-react'
import { useAuth } from './hooks/useAuth'
import { useTasks } from './hooks/useTasks'
import { useTeamMembers } from './hooks/useTeamMembers'
import { KanbanColumn } from './components/KanbanColumn'
import { TaskCard } from './components/TaskCard'
import { CreateTaskModal } from './components/CreateTaskModal'
import { TaskDetailModal } from './components/TaskDetailModal'
import { BoardStats } from './components/BoardStats'
import { TeamPanel } from './components/TeamPanel'
import { COLUMNS } from './types'
import type { Task, Status, Priority } from './types'
import './styles.css'

export default function App() {
  const { user, loading: authLoading } = useAuth()
  const { tasks, loading, error, createTask, updateTaskStatus, updateTask, deleteTask } = useTasks(user?.id)
  const { members, addMember, deleteMember } = useTeamMembers(user?.id)

  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [createStatus, setCreateStatus] = useState<Status>('todo')
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [showTeam, setShowTeam] = useState(false)
  const [search, setSearch] = useState('')
  const [filterPriority, setFilterPriority] = useState<Priority | 'all'>('all')

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase())
      const matchesPriority = filterPriority === 'all' || t.priority === filterPriority
      return matchesSearch && matchesPriority
    })
  }, [tasks, search, filterPriority])

  const tasksByColumn = useMemo(() => {
    const map: Record<Status, Task[]> = { todo: [], in_progress: [], in_review: [], done: [] }
    for (const t of filteredTasks) map[t.status].push(t)
    return map
  }, [filteredTasks])

  function handleDragStart(event: DragStartEvent) {
    const task = tasks.find(t => t.id === event.active.id)
    setActiveTask(task ?? null)
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveTask(null)
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    const activeTask = tasks.find(t => t.id === activeId)
    if (!activeTask) return

    const targetStatus = COLUMNS.find(c => c.id === overId)?.id
      ?? tasks.find(t => t.id === overId)?.status

    if (targetStatus && targetStatus !== activeTask.status) {
      await updateTaskStatus(activeId, targetStatus as Status)
    }
  }

  const openCreate = (status: Status) => {
    setCreateStatus(status)
    setShowCreate(true)
  }

  if (authLoading) {
    return (
      <div className="loading-screen">
        <Loader2 size={28} className="spin" />
        <span>Starting your workspace...</span>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <div className="logo">
            <span className="logo-mark">▸</span>
            <span className="logo-text">Kanban</span>
          </div>
          <div className="header-divider" />
          <span className="header-sub">Task Board</span>
        </div>

        <div className="header-center">
          <div className="search-wrap">
            <Search size={14} className="search-icon" />
            <input
              className="search-input"
              placeholder="Search tasks..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="header-right">
          <div className="priority-filters">
            {(['all', 'low', 'normal', 'high'] as const).map(p => (
              <button
                key={p}
                className={`filter-btn ${filterPriority === p ? 'active' : ''}`}
                onClick={() => setFilterPriority(p)}
              >
                {p === 'all' ? 'All' : p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
          <button className="btn-ghost" onClick={() => setShowTeam(true)} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Users size={14} />
            Team
            {members.length > 0 && <span className="team-badge">{members.length}</span>}
          </button>
          <button className="btn-primary" onClick={() => openCreate('todo')}>
            <Plus size={15} /> New task
          </button>
        </div>
      </header>

      <BoardStats tasks={tasks} />

      {error && (
        <div className="error-banner">
          Failed to load tasks: {error}
        </div>
      )}

      {loading ? (
        <div className="loading-screen" style={{ flex: 1 }}>
          <Loader2 size={24} className="spin" />
          <span>Loading board...</span>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <main className="board">
            {COLUMNS.map(col => (
              <KanbanColumn
                key={col.id}
                column={col}
                tasks={tasksByColumn[col.id]}
                onAddTask={() => openCreate(col.id)}
                onTaskClick={setSelectedTask}
                members={members}
              />
            ))}
          </main>

          <DragOverlay>
            {activeTask && (
              <div style={{ transform: 'rotate(2deg)', pointerEvents: 'none' }}>
                <TaskCard task={activeTask} onClick={() => {}} members={members} />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      )}

      {showCreate && (
        <CreateTaskModal
          defaultStatus={createStatus}
          onClose={() => setShowCreate(false)}
          onCreate={async (fields) => { await createTask(fields) }}
          members={members}
        />
      )}

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          members={members}
          onClose={() => setSelectedTask(null)}
          onUpdate={async (id, fields) => { await updateTask(id, fields) }}
          onUpdateStatus={async (id, status) => { await updateTaskStatus(id, status) }}
          onDelete={async (id) => { await deleteTask(id) }}
        />
      )}

      {showTeam && (
        <TeamPanel
          members={members}
          onAdd={addMember}
          onDelete={deleteMember}
          onClose={() => setShowTeam(false)}
        />
      )}
    </div>
  )
}
