import { supabase } from './supabase'
import type { ResolvedAction, Task } from './types'

const TABLE = 'tasks'

/** Fetch every task for the signed-in user (RLS scopes rows automatically). */
export async function fetchTasks(): Promise<Task[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as Task[]
}

export async function addTask(input: {
  title: string
  due_date?: string | null
  notes?: string | null
}): Promise<Task> {
  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      title: input.title,
      due_date: input.due_date ?? null,
      notes: input.notes ?? null,
    })
    .select()
    .single()
  if (error) throw error
  return data as Task
}

export async function completeTask(id: string): Promise<void> {
  const { error } = await supabase
    .from(TABLE)
    .update({ status: 'completed', completed_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

export async function reopenTask(id: string): Promise<void> {
  const { error } = await supabase
    .from(TABLE)
    .update({ status: 'active', completed_at: null })
    .eq('id', id)
  if (error) throw error
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase.from(TABLE).delete().eq('id', id)
  if (error) throw error
}

export async function updateTask(
  id: string,
  changes: { title?: string; due_date?: string | null; notes?: string | null },
): Promise<void> {
  const { error } = await supabase.from(TABLE).update(changes).eq('id', id)
  if (error) throw error
}

/** Apply a batch of resolved voice actions to the database, in order. */
export async function executeResolved(resolved: ResolvedAction[]): Promise<void> {
  for (const action of resolved) {
    switch (action.op) {
      case 'add':
        await addTask({ title: action.title, due_date: action.due_date, notes: action.notes })
        break
      case 'complete':
        await completeTask(action.task.id)
        break
      case 'delete':
        await deleteTask(action.task.id)
        break
      case 'update':
        await updateTask(action.task.id, action.changes)
        break
      case 'unresolved':
        break
    }
  }
}
