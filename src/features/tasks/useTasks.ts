import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../../lib/supabase'
import * as api from '../../lib/taskApi'
import { planActions, summarizeActions } from '../../lib/taskLogic'
import { interpretVoice } from '../../lib/voiceApi'
import type { Task } from '../../lib/types'
import { useToast } from '../../components/Toast'

export function useTasks(userId: string | null) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const toast = useToast()
  const tasksRef = useRef<Task[]>([])
  tasksRef.current = tasks

  const refetch = useCallback(async () => {
    try {
      const data = await api.fetchTasks()
      setTasks(data)
    } catch (e: any) {
      toast(e?.message ?? 'Failed to load tasks', 'error')
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    if (!userId) return
    refetch()
    // Live sync across devices (requires realtime enabled on the table).
    const channel = supabase
      .channel('tasks-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        refetch()
      })
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, refetch])

  const add = useCallback(
    async (title: string, due_date: string | null = null) => {
      const clean = title.trim()
      if (!clean) return
      try {
        await api.addTask({ title: clean, due_date })
        await refetch()
      } catch (e: any) {
        toast(e?.message ?? 'Could not add task', 'error')
      }
    },
    [refetch, toast],
  )

  const complete = useCallback(
    async (task: Task) => {
      // optimistic: drop it from the active list immediately
      setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: 'completed' } : t)))
      try {
        await api.completeTask(task.id)
        await refetch()
      } catch (e: any) {
        toast(e?.message ?? 'Could not complete task', 'error')
        await refetch()
      }
    },
    [refetch, toast],
  )

  const reopen = useCallback(
    async (task: Task) => {
      try {
        await api.reopenTask(task.id)
        await refetch()
      } catch (e: any) {
        toast(e?.message ?? 'Could not reopen task', 'error')
      }
    },
    [refetch, toast],
  )

  const remove = useCallback(
    async (task: Task) => {
      setTasks((prev) => prev.filter((t) => t.id !== task.id))
      try {
        await api.deleteTask(task.id)
      } catch (e: any) {
        toast(e?.message ?? 'Could not delete task', 'error')
        await refetch()
      }
    },
    [refetch, toast],
  )

  const edit = useCallback(
    async (task: Task, changes: { title?: string; due_date?: string | null }) => {
      try {
        await api.updateTask(task.id, changes)
        await refetch()
      } catch (e: any) {
        toast(e?.message ?? 'Could not update task', 'error')
      }
    },
    [refetch, toast],
  )

  /** Run a spoken transcript through Claude and apply the resulting actions. */
  const runVoice = useCallback(
    async (transcript: string) => {
      try {
        const { actions, reply } = await interpretVoice(transcript, tasksRef.current)
        const resolved = planActions(actions ?? [], tasksRef.current)
        await api.executeResolved(resolved)
        await refetch()
        toast(reply?.trim() || summarizeActions(resolved), 'success')
      } catch (e: any) {
        toast(e?.message ?? 'Voice command failed', 'error')
      }
    },
    [refetch, toast],
  )

  return { tasks, loading, refetch, add, complete, reopen, remove, edit, runVoice }
}
