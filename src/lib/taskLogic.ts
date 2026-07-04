import type { RawAction, ResolvedAction, Task } from './types'

/** Lowercase + collapse whitespace for fuzzy matching. */
function normalize(s: string): string {
  return s.toLowerCase().replace(/\s+/g, ' ').trim()
}

/**
 * Resolve a free-text query to the best-matching active task.
 *
 * Strategy (first hit wins):
 *   1. exact title match
 *   2. title contains the query (or query contains the title)
 *   3. most overlapping words
 * Only `active` tasks are considered — you can't complete/delete a done task.
 */
export function matchTask(query: string, tasks: Task[]): Task | null {
  const active = tasks.filter((t) => t.status === 'active')
  if (active.length === 0) return null

  const q = normalize(query)
  if (!q) return null

  // 1. exact
  const exact = active.find((t) => normalize(t.title) === q)
  if (exact) return exact

  // 2. substring either direction
  const contains = active.find((t) => {
    const title = normalize(t.title)
    return title.includes(q) || q.includes(title)
  })
  if (contains) return contains

  // 3. word overlap
  const qWords = new Set(q.split(' ').filter(Boolean))
  let best: Task | null = null
  let bestScore = 0
  for (const t of active) {
    const words = normalize(t.title).split(' ').filter(Boolean)
    const score = words.reduce((acc, w) => acc + (qWords.has(w) ? 1 : 0), 0)
    if (score > bestScore) {
      bestScore = score
      best = t
    }
  }
  return bestScore > 0 ? best : null
}

/**
 * Turn the raw actions Claude returned into concrete, resolved operations
 * against the current task list. Pure — no I/O — so it is easy to unit test
 * and to reuse for optimistic UI updates.
 */
export function planActions(actions: RawAction[], tasks: Task[]): ResolvedAction[] {
  return actions.map((a): ResolvedAction => {
    switch (a.type) {
      case 'add':
        return {
          op: 'add',
          title: a.title.trim(),
          due_date: a.due_date ?? null,
          notes: a.notes ?? null,
        }
      case 'complete':
      case 'delete': {
        const task = resolve(a.task_id, a.query, tasks)
        if (!task) {
          return { op: 'unresolved', type: a.type, query: a.query ?? a.task_id ?? '' }
        }
        return { op: a.type === 'complete' ? 'complete' : 'delete', task }
      }
      case 'update': {
        const task = resolve(a.task_id, a.query, tasks)
        if (!task) {
          return { op: 'unresolved', type: 'update', query: a.query ?? a.task_id ?? '' }
        }
        return { op: 'update', task, changes: a.changes ?? {} }
      }
      default:
        return { op: 'unresolved', type: 'add', query: '' }
    }
  })
}

function resolve(taskId: string | undefined, query: string | undefined, tasks: Task[]): Task | null {
  if (taskId) {
    const byId = tasks.find((t) => t.id === taskId)
    if (byId) return byId
  }
  if (query) return matchTask(query, tasks)
  return null
}

/** Human-readable summary of what a batch of resolved actions did. */
export function summarizeActions(resolved: ResolvedAction[]): string {
  const counts = { add: 0, complete: 0, delete: 0, update: 0, unresolved: 0 }
  for (const r of resolved) counts[r.op]++

  const parts: string[] = []
  if (counts.add) parts.push(`added ${counts.add}`)
  if (counts.complete) parts.push(`completed ${counts.complete}`)
  if (counts.delete) parts.push(`deleted ${counts.delete}`)
  if (counts.update) parts.push(`updated ${counts.update}`)

  let summary = parts.length ? capitalize(parts.join(' · ')) : 'Nothing to do'
  if (counts.unresolved) {
    summary += ` · ${counts.unresolved} couldn't be matched`
  }
  return summary
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
