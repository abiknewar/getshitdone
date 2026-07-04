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
  const over = isOverdue(task.due_date)

  function saveEdit() {
    const clean = draft.trim()
    if (clean && clean !== task.title) onEdit(task, { title: clean })
    setEditing(false)
  }

  return (
    <li className="flex items-center gap-3 rounded-2xl border border-line bg-paper px-3.5 py-3">
      <button
        type="button"
        onClick={() => onComplete(task)}
        aria-label="Mark complete"
        className="grid h-6 w-6 flex-none place-items-center rounded-full border-2 border-line-2 text-transparent transition-colors hover:border-ink hover:text-ink"
      >
        <CheckIcon className="h-3.5 w-3.5" />
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
            className="block w-full truncate text-left text-[15px] leading-snug"
          >
            {task.title}
          </button>
        )}
        {due &&
          (over ? (
            <span className="mt-1 inline-block rounded bg-ink px-1.5 py-0.5 font-mono text-[11px] text-white">
              {due}
            </span>
          ) : (
            <span
              className={
                'mt-0.5 block font-mono text-[11px] ' + (isToday(task.due_date) ? 'text-ink' : 'text-faint')
              }
            >
              {due}
            </span>
          ))}
      </div>

      <button
        type="button"
        onClick={() => onDelete(task)}
        aria-label="Delete task"
        className="flex-none rounded-lg p-2 text-faint transition-colors hover:bg-paper-2 hover:text-ink"
      >
        <TrashIcon />
      </button>
    </li>
  )
}
