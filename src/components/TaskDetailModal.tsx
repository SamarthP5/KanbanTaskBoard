import { useState } from 'react'
import { X, Trash2, Flag, Calendar, Edit3, Check, User } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import type { Task, Priority, Status } from '../types'
import { PRIORITY_CONFIG, COLUMNS } from '../types'
import type { TeamMember } from '../hooks/useTeamMembers'

interface Props {
  task: Task
  members: TeamMember[]
  onClose: () => void
  onUpdate: (id: string, fields: Partial<Pick<Task, 'title' | 'description' | 'priority' | 'due_date' | 'assignee_id'>>) => Promise<void>
  onUpdateStatus: (id: string, status: Status) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export function TaskDetailModal({ task, members, onClose, onUpdate, onUpdateStatus, onDelete }: Props) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description ?? '')
  const [priority, setPriority] = useState<Priority>(task.priority)
  const [dueDate, setDueDate] = useState(task.due_date ?? '')
  const [status, setStatus] = useState<Status>(task.status)
  const [assigneeId, setAssigneeId] = useState<string>(task.assignee_id ?? '')
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    await onUpdate(task.id, {
      title: title.trim(),
      description: description.trim() || null,
      priority,
      due_date: dueDate || null,
      assignee_id: assigneeId || null,
    })
    if (status !== task.status) {
      await onUpdateStatus(task.id, status)
    }
    setSaving(false)
    setEditing(false)
  }

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return }
    await onDelete(task.id)
    onClose()
  }

  const currentCol = COLUMNS.find(c => c.id === (editing ? status : task.status))
  const assignee = members.find(m => m.id === task.assignee_id)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-detail" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title" style={{ color: currentCol?.color }}>
            {currentCol?.label}
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            {!editing && (
              <button className="modal-close" onClick={() => setEditing(true)} title="Edit"><Edit3 size={15} /></button>
            )}
            {editing && (
              <button className="modal-close" onClick={handleSave} disabled={saving} title="Save">
                <Check size={15} />
              </button>
            )}
            <button
              className="modal-close"
              onClick={handleDelete}
              title={confirmDelete ? 'Confirm delete' : 'Delete'}
              style={{ color: confirmDelete ? '#ef4444' : undefined }}
            >
              <Trash2 size={15} />
            </button>
            <button className="modal-close" onClick={onClose}><X size={16} /></button>
          </div>
        </div>

        <div className="modal-body">
          {editing ? (
            <>
              <input
                className="modal-input modal-input-title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                autoFocus
              />
              <textarea
                className="modal-input modal-textarea"
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={4}
                placeholder="Description..."
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
                  <label className="modal-label">Move to</label>
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
                  <input type="date" className="modal-input" value={dueDate} onChange={e => setDueDate(e.target.value)} />
                </div>
                <div className="modal-field">
                  <label className="modal-label"><User size={12} /> Assignee</label>
                  <select className="modal-select" value={assigneeId} onChange={e => setAssigneeId(e.target.value)}>
                    <option value="">Unassigned</option>
                    {members.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          ) : (
            <>
              <h2 className="detail-title">{task.title}</h2>
              {task.description && <p className="detail-desc">{task.description}</p>}
              <div className="detail-meta">
                <div className="detail-meta-item">
                  <Flag size={13} style={{ color: PRIORITY_CONFIG[task.priority].color }} />
                  <span style={{ color: PRIORITY_CONFIG[task.priority].color }}>{PRIORITY_CONFIG[task.priority].label} priority</span>
                </div>
                {assignee && (
                  <div className="detail-meta-item">
                    <span className="avatar avatar-sm" style={{ background: assignee.color }}>
                      {assignee.name.charAt(0).toUpperCase()}
                    </span>
                    <span>{assignee.name}</span>
                  </div>
                )}
                {task.due_date && (
                  <div className="detail-meta-item">
                    <Calendar size={13} />
                    <span>Due {format(parseISO(task.due_date), 'MMMM d, yyyy')}</span>
                  </div>
                )}
                <div className="detail-meta-item">
                  <span style={{ color: '#6b7280' }}>Created {format(parseISO(task.created_at), 'MMM d, yyyy')}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {editing && (
          <div className="modal-footer">
            <button className="btn-ghost" onClick={() => { setEditing(false); setTitle(task.title); setDescription(task.description ?? '') }}>Cancel</button>
            <button className="btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
