import type { Task } from '../../lib/types'
import { TaskItem } from './TaskItem'

interface Props {
  title: string
  tasks: Task[]
  accent?: 'default' | 'danger' | 'brand'
  onComplete: (task: Task) => void
  onDelete: (task: Task) => void
  onEdit: (task: Task, changes: { title?: string }) => void
}

export function TaskSection({ title, tasks, accent = 'default', onComplete, onDelete, onEdit }: Props) {
  if (tasks.length === 0) return null
  const color =
    accent === 'danger' ? 'text-bad' : accent === 'brand' ? 'text-brand-soft' : 'text-muted'
  return (
    <section className="flex flex-col gap-2">
      <h2 className={'px-1 text-xs font-semibold uppercase tracking-wide ' + color}>
        {title} <span className="text-muted">· {tasks.length}</span>
      </h2>
      <ul className="flex flex-col gap-2">
        {tasks.map((t) => (
          <TaskItem key={t.id} task={t} onComplete={onComplete} onDelete={onDelete} onEdit={onEdit} />
        ))}
      </ul>
    </section>
  )
}
