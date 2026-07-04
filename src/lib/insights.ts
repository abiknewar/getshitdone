import {
  format,
  parseISO,
  startOfDay,
  subDays,
  subMonths,
  startOfMonth,
  isSameDay,
  isSameMonth,
} from 'date-fns'
import type { Task } from './types'

export type Range = 'week' | 'month' | 'year'

export interface Bucket {
  /** short label for the x-axis, e.g. "Mon" or "Jul" */
  label: string
  count: number
}

export interface Insights {
  range: Range
  buckets: Bucket[]
  completedInRange: number
  activeCount: number
  /** all-time completion rate as a 0–100 integer */
  completionRate: number
  /** consecutive days ending today with at least one completion */
  streak: number
}

function completedDates(tasks: Task[]): Date[] {
  return tasks
    .filter((t) => t.status === 'completed' && t.completed_at)
    .map((t) => parseISO(t.completed_at as string))
}

/** Consecutive days (ending today) that have at least one completed task. */
export function currentStreak(tasks: Task[], now: Date): number {
  const dates = completedDates(tasks)
  let streak = 0
  let cursor = startOfDay(now)
  // If nothing today, the streak may still be "alive" from yesterday's view,
  // but for a productivity streak we count only if today already has one.
  for (;;) {
    const hit = dates.some((d) => isSameDay(d, cursor))
    if (!hit) break
    streak++
    cursor = subDays(cursor, 1)
  }
  return streak
}

export function buildInsights(tasks: Task[], range: Range, now: Date): Insights {
  const dates = completedDates(tasks)
  const buckets: Bucket[] = []

  if (range === 'year') {
    for (let i = 11; i >= 0; i--) {
      const month = startOfMonth(subMonths(now, i))
      buckets.push({
        label: format(month, 'MMM'),
        count: dates.filter((d) => isSameMonth(d, month)).length,
      })
    }
  } else {
    const days = range === 'week' ? 7 : 30
    for (let i = days - 1; i >= 0; i--) {
      const day = subDays(startOfDay(now), i)
      buckets.push({
        label: range === 'week' ? format(day, 'EEE') : format(day, 'd'),
        count: dates.filter((d) => isSameDay(d, day)).length,
      })
    }
  }

  const completedInRange = buckets.reduce((sum, b) => sum + b.count, 0)
  const activeCount = tasks.filter((t) => t.status === 'active').length
  const completedAll = tasks.filter((t) => t.status === 'completed').length
  const total = completedAll + activeCount
  const completionRate = total === 0 ? 0 : Math.round((completedAll / total) * 100)

  return {
    range,
    buckets,
    completedInRange,
    activeCount,
    completionRate,
    streak: currentStreak(tasks, now),
  }
}
