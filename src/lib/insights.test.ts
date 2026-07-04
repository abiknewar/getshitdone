import { describe, it, expect } from 'vitest'
import { buildInsights, currentStreak } from './insights'
import type { Task } from './types'

function done(id: string, completedAt: string): Task {
  return {
    id,
    user_id: 'u1',
    title: `t${id}`,
    notes: null,
    status: 'completed',
    due_date: null,
    priority: null,
    tags: null,
    created_at: completedAt,
    updated_at: completedAt,
    completed_at: completedAt,
  }
}

function active(id: string): Task {
  return { ...done(id, '2026-07-01T00:00:00.000Z'), status: 'active', completed_at: null }
}

const now = new Date('2026-07-04T12:00:00.000Z')

describe('buildInsights', () => {
  it('buckets weekly completions by day (7 buckets)', () => {
    const tasks = [
      done('1', '2026-07-04T09:00:00.000Z'),
      done('2', '2026-07-04T11:00:00.000Z'),
      done('3', '2026-07-02T09:00:00.000Z'),
      active('4'),
    ]
    const ins = buildInsights(tasks, 'week', now)
    expect(ins.buckets).toHaveLength(7)
    // last bucket is "today" with 2 completions
    expect(ins.buckets[6].count).toBe(2)
    expect(ins.completedInRange).toBe(3)
    expect(ins.activeCount).toBe(1)
  })

  it('produces 12 monthly buckets for the year range', () => {
    const ins = buildInsights([done('1', '2026-07-04T09:00:00.000Z')], 'year', now)
    expect(ins.buckets).toHaveLength(12)
    expect(ins.buckets[11].count).toBe(1) // current month
  })

  it('computes all-time completion rate', () => {
    const tasks = [
      done('1', '2026-07-04T09:00:00.000Z'),
      done('2', '2026-07-03T09:00:00.000Z'),
      done('3', '2026-07-02T09:00:00.000Z'),
      active('4'),
    ]
    const ins = buildInsights(tasks, 'week', now)
    expect(ins.completionRate).toBe(75) // 3 done of 4 total
  })
})

describe('currentStreak', () => {
  it('counts consecutive days ending today', () => {
    const tasks = [
      done('1', '2026-07-04T09:00:00.000Z'),
      done('2', '2026-07-03T09:00:00.000Z'),
      done('3', '2026-07-02T09:00:00.000Z'),
    ]
    expect(currentStreak(tasks, now)).toBe(3)
  })

  it('is zero when today has no completion', () => {
    const tasks = [done('1', '2026-07-03T09:00:00.000Z')]
    expect(currentStreak(tasks, now)).toBe(0)
  })

  it('stops at the first gap', () => {
    const tasks = [
      done('1', '2026-07-04T09:00:00.000Z'),
      // gap on 07-03
      done('3', '2026-07-02T09:00:00.000Z'),
    ]
    expect(currentStreak(tasks, now)).toBe(1)
  })
})
