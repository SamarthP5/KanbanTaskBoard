import { useState } from 'react'
import { X, Plus, Trash2, Users } from 'lucide-react'
import type { TeamMember } from '../hooks/useTeamMembers'

const COLORS = [
  '#6366f1', '#3b82f6', '#22c55e', '#f59e0b',
  '#ef4444', '#a855f7', '#ec4899', '#14b8a6',
]

interface Props {
  members: TeamMember[]
  onAdd: (name: string, color: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onClose: () => void
}

export function TeamPanel({ members, onAdd, onDelete, onClose }: Props) {
  const [name, setName] = useState('')
  const [color, setColor] = useState(COLORS[0])
  const [adding, setAdding] = useState(false)

  const handleAdd = async () => {
    if (!name.trim()) return
    setAdding(true)
    await onAdd(name.trim(), color)
    setName('')
    setAdding(false)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Users size={13} /> Team Members
          </span>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="modal-body">
          {/* Add member */}
          <div className="team-add-row">
            <input
              className="modal-input"
              placeholder="Member name..."
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleAdd() }}
              autoFocus
              style={{ flex: 1 }}
            />
            <button className="btn-primary" onClick={handleAdd} disabled={!name.trim() || adding}>
              <Plus size={14} />
            </button>
          </div>

          {/* Color picker */}
          <div className="color-row">
            {COLORS.map(c => (
              <button
                key={c}
                className={`color-swatch ${color === c ? 'selected' : ''}`}
                style={{ background: c }}
                onClick={() => setColor(c)}
              />
            ))}
          </div>

          {/* Member list */}
          {members.length === 0 ? (
            <div className="column-empty">No team members yet</div>
          ) : (
            <div className="member-list">
              {members.map(m => (
                <div key={m.id} className="member-row">
                  <div className="avatar" style={{ background: m.color }}>
                    {m.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="member-name">{m.name}</span>
                  <button className="modal-close" onClick={() => onDelete(m.id)} title="Remove">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
