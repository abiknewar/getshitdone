export type TaskStatus = 'active' | 'completed'

export interface Task {
  id: string
  user_id: string
  title: string
  notes: string | null
  status: TaskStatus
  /** ISO date (yyyy-mm-dd) the task is scheduled for, or null = "someday". */
  due_date: string | null
  priority: number | null
  tags: string[] | null
  created_at: string
  updated_at: string
  completed_at: string | null
}

/**
 * A raw action as returned by Claude (via the voice-intent Edge Function).
 * Claude may reference an existing task either by its exact `task_id` or by a
 * free-text `query` (e.g. "call mom") which we resolve on the client.
 */
export type RawAction =
  | {
      type: 'add'
      title: string
      due_date?: string | null
      notes?: string | null
    }
  | { type: 'complete'; task_id?: string; query?: string }
  | { type: 'delete'; task_id?: string; query?: string }
  | {
      type: 'update'
      task_id?: string
      query?: string
      changes: { title?: string; due_date?: string | null; notes?: string | null }
    }

/** An action after we've resolved any `query` to a concrete task. */
export type ResolvedAction =
  | { op: 'add'; title: string; due_date: string | null; notes: string | null }
  | { op: 'complete'; task: Task }
  | { op: 'delete'; task: Task }
  | {
      op: 'update'
      task: Task
      changes: { title?: string; due_date?: string | null; notes?: string | null }
    }
  | { op: 'unresolved'; type: RawAction['type']; query: string }

export interface VoiceIntentResponse {
  /** Short natural-language reply for the user, e.g. "Added 2 tasks." */
  reply?: string
  actions: RawAction[]
}
