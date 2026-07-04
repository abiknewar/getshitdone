import { createContext, useContext, type ReactNode } from 'react'
import { useTasks } from './useTasks'

type TasksApi = ReturnType<typeof useTasks>

const TasksContext = createContext<TasksApi | undefined>(undefined)

export function TasksProvider({ userId, children }: { userId: string; children: ReactNode }) {
  const api = useTasks(userId)
  return <TasksContext.Provider value={api}>{children}</TasksContext.Provider>
}

export function useTasksContext(): TasksApi {
  const ctx = useContext(TasksContext)
  if (!ctx) throw new Error('useTasksContext must be used within TasksProvider')
  return ctx
}
