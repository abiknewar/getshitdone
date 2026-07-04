import { describe, it, expect } from 'vitest'
import { matchTask, planActions, summarizeActions } from './taskLogic'
import type { RawAction, Task } from './types'

function task(partial: Partial<Task> & { id: string; title: string }): Task {
  return {
    user_id: 'u1',
    notes: null,
    status: 'active',
    due_date: null,
    priority: null,
    tags: null,
    created_at: '2026-07-04T00:00:00.000Z',
    updated_at: '2026-07-04T00:00:00.000Z',
    completed_at: null,
    ...partial,
  }
}

const tasks: Task[] = [
  task({ id: '1', title: 'Call mom' }),
  task({ id: '2', title: 'Buy milk' }),
  task({ id: '3', title: 'Finish quarterly report' }),
  task({ id: '4', title: 'Old done thing', status: 'completed', completed_at: '2026-07-01T10:00:00.000Z' }),
]

describe('matchTask', () => {
  it('matches by exact title (case-insensitive)', () => {
    expect(matchTask('call mom', tasks)?.id).toBe('1')
  })

  it('matches by substring', () => {
    expect(matchTask('the report', tasks)?.id).toBe('3')
    expect(matchTask('milk', tasks)?.id).toBe('2')
  })

  it('matches by word overlap', () => {
    expect(matchTask('quarterly stuff', tasks)?.id).toBe('3')
  })

  it('never matches a completed task', () => {
    expect(matchTask('old done thing', tasks)).toBeNull()
  })

  it('returns null when nothing plausibly matches', () => {
    expect(matchTask('xyzzy nonexistent', tasks)).toBeNull()
  })
})

describe('planActions', () => {
  it('plans an add', () => {
    const actions: RawAction[] = [{ type: 'add', title: '  Water plants  ', due_date: '2026-07-05' }]
    const [r] = planActions(actions, tasks)
    expect(r).toEqual({ op: 'add', title: 'Water plants', due_date: '2026-07-05', notes: null })
  })

  it('completes a task referenced by query', () => {
    const [r] = planActions([{ type: 'complete', query: 'buy milk' }], tasks)
    expect(r.op).toBe('complete')
    if (r.op === 'complete') expect(r.task.id).toBe('2')
  })

  it('deletes a task referenced by id', () => {
    const [r] = planActions([{ type: 'delete', task_id: '1' }], tasks)
    expect(r.op).toBe('delete')
    if (r.op === 'delete') expect(r.task.id).toBe('1')
  })

  it('marks unmatched references as unresolved', () => {
    const [r] = planActions([{ type: 'complete', query: 'walk the dinosaur' }], tasks)
    expect(r.op).toBe('unresolved')
  })

  it('handles a multi-action utterance in order', () => {
    const actions: RawAction[] = [
      { type: 'add', title: 'Book flights' },
      { type: 'complete', query: 'call mom' },
      { type: 'delete', query: 'milk' },
    ]
    const resolved = planActions(actions, tasks)
    expect(resolved.map((r) => r.op)).toEqual(['add', 'complete', 'delete'])
  })
})

describe('summarizeActions', () => {
  it('summarizes a mixed batch', () => {
    const resolved = planActions(
      [
        { type: 'add', title: 'A' },
        { type: 'add', title: 'B' },
        { type: 'complete', query: 'call mom' },
      ],
      tasks,
    )
    expect(summarizeActions(resolved)).toBe('Added 2 · completed 1')
  })

  it('notes unmatched actions', () => {
    const resolved = planActions([{ type: 'complete', query: 'nope' }], tasks)
    expect(summarizeActions(resolved)).toContain("couldn't be matched")
  })
})
