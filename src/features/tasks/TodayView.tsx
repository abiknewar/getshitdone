import { useState } from 'react'
import { format } from 'date-fns'
import { MicButton } from './MicButton'
import { QuickAdd } from './QuickAdd'
import { TaskSection } from './TaskSection'
import { useTasksContext } from './TasksContext'
import { isOverdue, isToday, todayISO } from '../../lib/date'
import { EmptyState } from '../../components/EmptyState'

export function TodayView() {
  const { tasks, loading, add, complete, remove, edit, runVoice } = useTasksContext()
  const [busy, setBusy] = useState(false)

  const active = tasks.filter((t) => t.status === 'active')
  const overdue = active.filter((t) => isOverdue(t.due_date))
  const dueToday = active.filter((t) => isToday(t.due_date))
  const nothingToday = overdue.length === 0 && dueToday.length === 0

  async function handleTranscript(text: string) {
    setBusy(true)
    await runVoice(text)
    setBusy(false)
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="pt-2">
        <p className="text-sm text-muted">{format(new Date(), 'EEEE, MMMM d')}</p>
        <h1 className="text-2xl font-bold">Today</h1>
      </header>

      <div className="flex flex-col items-center gap-4 py-2">
        <MicButton onTranscript={handleTranscript} busy={busy} />
      </div>

      <QuickAdd onAdd={(title) => add(title, todayISO())} placeholder="Add something for today…" />

      {loading ? (
        <p className="py-8 text-center text-sm text-muted">Loading…</p>
      ) : nothingToday ? (
        <EmptyState
          title="Nothing due today 🎉"
          hint="Tap the mic and say what you need to do — or add it above."
        />
      ) : (
        <div className="flex flex-col gap-6">
          <TaskSection
            title="Overdue"
            tasks={overdue}
            accent="danger"
            onComplete={complete}
            onDelete={remove}
            onEdit={edit}
          />
          <TaskSection
            title="Today"
            tasks={dueToday}
            accent="brand"
            onComplete={complete}
            onDelete={remove}
            onEdit={edit}
          />
        </div>
      )}
    </div>
  )
}
