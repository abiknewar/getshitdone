import { useState } from 'react'
import type { Task } from '../../lib/types'
import { CheckIcon, TrashIcon } from '../../components/icons'
import { formatDue, isOverdue, isToday } from '../../lib/date'

interface Props {
  task: Task
  onComplete: (task: Task) => void
  onDelete: (task: Task) => void
  onEdit: (task: Task, changes: { title?: string }) => void
}

export function TaskItem({ task, onComplete, onDelete, onEdit }: Props) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(task.title)
  const due = formatDue(task.due_date)

  function saveEdit() {
    const clean = draft.trim()
    if (clean && clean !== task.title) onEdit(task, { title: clean })
    setEditing(false)
  }

  return (
    <li className="card flex items-center gap-3 px-3 py-3">
      <button
        type="button"
        onClick={() => onComplete(task)}
        aria-label="Mark complete"
        className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 border-border text-transparent transition-colors hover:border-good hover:text-good"
      >
        <CheckIcon className="h-4 w-4" />
      </button>

      <div className="min-w-0 flex-1">
        {editing ? (
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={saveEdit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveEdit()
              if (e.key === 'Escape') setEditing(false)
            }}
            className="input py-1"
          />
        ) : (
          <button
            type="button"
            onClick={() => {
              setDraft(task.title)
              setEditing(true)
            }}
            className="block w-full truncate text-left"
          >
            {task.title}
          </button>
        )}
        {due && (
          <span
            className={
              'mt-0.5 block text-xs ' +
              (isOverdue(task.due_date) ? 'text-bad' : isToday(task.due_date) ? 'text-brand-soft' : 'text-muted')
            }
          >
            {due}
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={() => onDelete(task)}
        aria-label="Delete task"
        className="flex-shrink-0 rounded-lg p-2 text-muted transition-colors hover:bg-surface-2 hover:text-bad"
      >
        <TrashIcon />
      </button>
    </li>
  )
}
