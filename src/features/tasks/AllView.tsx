import { QuickAdd } from './QuickAdd'
import { TaskSection } from './TaskSection'
import { useTasksContext } from './TasksContext'
import { isOverdue, isToday } from '../../lib/date'
import { EmptyState } from '../../components/EmptyState'

export function AllView() {
  const { tasks, loading, add, complete, remove, edit } = useTasksContext()

  const active = tasks.filter((t) => t.status === 'active')
  const overdue = active.filter((t) => isOverdue(t.due_date))
  const today = active.filter((t) => isToday(t.due_date))
  const upcoming = active.filter((t) => t.due_date && !isToday(t.due_date) && !isOverdue(t.due_date))
  const someday = active.filter((t) => !t.due_date)

  return (
    <div className="flex flex-col gap-6">
      <header className="pt-2">
        <h1 className="text-2xl font-bold">All tasks</h1>
        <p className="text-sm text-muted">Everything on your plate until it's done.</p>
      </header>

      <QuickAdd onAdd={(title) => add(title, null)} placeholder="Add a someday task…" />

      {loading ? (
        <p className="py-8 text-center text-sm text-muted">Loading…</p>
      ) : active.length === 0 ? (
        <EmptyState title="All clear ✨" hint="You've got no open tasks. Nice." />
      ) : (
        <div className="flex flex-col gap-6">
          <TaskSection title="Overdue" tasks={overdue} accent="danger" onComplete={complete} onDelete={remove} onEdit={edit} />
          <TaskSection title="Today" tasks={today} accent="brand" onComplete={complete} onDelete={remove} onEdit={edit} />
          <TaskSection title="Upcoming" tasks={upcoming} onComplete={complete} onDelete={remove} onEdit={edit} />
          <TaskSection title="Someday" tasks={someday} onComplete={complete} onDelete={remove} onEdit={edit} />
        </div>
      )}
    </div>
  )
}
