import { useState } from 'react'
import { X, Flag, Calendar, User } from 'lucide-react'
import type { Priority, Status } from '../types'
import { COLUMNS, PRIORITY_CONFIG } from '../types'
import type { TeamMember } from '../hooks/useTeamMembers'

interface Props {
  defaultStatus?: Status
  members?: TeamMember[]
  onClose: () => void
  onCreate: (fields: { title: string; description?: string; priority: Priority; due_date?: string; status: Status; assignee_id?: string }) => Promise<void>
}

export function CreateTaskModal({ defaultStatus = 'todo', members = [], onClose, onCreate }: Props) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<Priority>('normal')
  const [dueDate, setDueDate] = useState('')
  const [status, setStatus] = useState<Status>(defaultStatus)
  const [assigneeId, setAssigneeId] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!title.trim()) return
    setSubmitting(true)
    await onCreate({
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      due_date: dueDate || undefined,
      status,
      assignee_id: assigneeId || undefined,
    })
    setSubmitting(false)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">New Task</span>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="modal-body">
          <input
            className="modal-input modal-input-title"
            placeholder="Task title..."
            value={title}
            onChange={e => setTitle(e.target.value)}
            autoFocus
            onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }}
          />

          <textarea
            className="modal-input modal-textarea"
            placeholder="Description (optional)"
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
          />

          <div className="modal-row">
            <div className="modal-field">
              <label className="modal-label"><Flag size={12} /> Priority</label>
              <div className="modal-options">
                {(Object.keys(PRIORITY_CONFIG) as Priority[]).map(p => (
                  <button
                    key={p}
                    className={`modal-option ${priority === p ? 'selected' : ''}`}
                    style={{ '--opt-color': PRIORITY_CONFIG[p].color } as React.CSSProperties}
                    onClick={() => setPriority(p)}
                  >
                    {PRIORITY_CONFIG[p].label}
                  </button>
                ))}
              </div>
            </div>

            <div className="modal-field">
              <label className="modal-label">Column</label>
              <select className="modal-select" value={status} onChange={e => setStatus(e.target.value as Status)}>
                {COLUMNS.map(col => (
                  <option key={col.id} value={col.id}>{col.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="modal-row">
            <div className="modal-field">
              <label className="modal-label"><Calendar size={12} /> Due date</label>
              <input
                type="date"
                className="modal-input"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
              />
            </div>
            {members.length > 0 && (
              <div className="modal-field">
                <label className="modal-label"><User size={12} /> Assignee</label>
                <select className="modal-select" value={assigneeId} onChange={e => setAssigneeId(e.target.value)}>
                  <option value="">Unassigned</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSubmit} disabled={!title.trim() || submitting}>
            {submitting ? 'Creating...' : 'Create task'}
          </button>
        </div>
      </div>
    </div>
  )
}
