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
  const isOver = accent === 'danger'
  return (
    <section className="flex flex-col gap-2.5">
      <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.1em] text-muted">
        <span
          className={
            'inline-block h-[5px] w-[5px] rounded-full bg-ink ' +
            (isOver ? 'shadow-[0_0_0_2px_#fff,0_0_0_3px_#0E0E0E]' : '')
          }
        />
        {title} <span className="text-faint">· {tasks.length}</span>
      </h2>
      <ul className="flex flex-col gap-2">
        {tasks.map((t) => (
          <TaskItem key={t.id} task={t} onComplete={onComplete} onDelete={onDelete} onEdit={onEdit} />
        ))}
      </ul>
    </section>
  )
}
