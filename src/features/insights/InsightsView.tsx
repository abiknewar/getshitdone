import { useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useTasksContext } from '../tasks/TasksContext'
import { buildInsights, type Range } from '../../lib/insights'
import { StatTile } from './StatTile'

const RANGES: { key: Range; label: string }[] = [
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
  { key: 'year', label: 'Year' },
]

const BRAND = '#7c5cff'
const BRAND_SOFT = '#a78bfa'

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const count = payload[0].value as number
  return (
    <div className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-xs shadow-lg">
      <div className="font-medium text-text">{label}</div>
      <div className="text-muted">
        {count} {count === 1 ? 'task' : 'tasks'} done
      </div>
    </div>
  )
}

export function InsightsView() {
  const { tasks, loading } = useTasksContext()
  const [range, setRange] = useState<Range>('week')

  const insights = useMemo(() => buildInsights(tasks, range, new Date()), [tasks, range])
  const maxIdx = useMemo(() => {
    let idx = -1
    let max = 0
    insights.buckets.forEach((b, i) => {
      if (b.count > max) {
        max = b.count
        idx = i
      }
    })
    return max > 0 ? idx : -1
  }, [insights])

  const rangeLabel = range === 'week' ? 'this week' : range === 'month' ? 'last 30 days' : 'this year'

  return (
    <div className="flex flex-col gap-6">
      <header className="pt-2">
        <h1 className="text-2xl font-bold">Insights</h1>
        <p className="text-sm text-muted">How much you're getting done.</p>
      </header>

      <div className="grid grid-cols-2 gap-3">
        <StatTile label="Current streak" value={insights.streak} suffix={insights.streak === 1 ? 'day' : 'days'} />
        <StatTile label={`Done ${rangeLabel}`} value={insights.completedInRange} />
        <StatTile label="Completion rate" value={insights.completionRate} suffix="%" />
        <StatTile label="Still open" value={insights.activeCount} />
      </div>

      <div className="card flex flex-col gap-4 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Tasks completed</h2>
          <div className="flex gap-1 rounded-lg bg-surface-2 p-1">
            {RANGES.map((r) => (
              <button
                key={r.key}
                type="button"
                onClick={() => setRange(r.key)}
                className={
                  'rounded-md px-3 py-1 text-xs font-medium transition-colors ' +
                  (range === r.key ? 'bg-brand text-white' : 'text-muted hover:text-text')
                }
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p className="py-8 text-center text-sm text-muted">Loading…</p>
        ) : (
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={insights.buckets} margin={{ top: 8, right: 4, bottom: 0, left: -20 }}>
                <CartesianGrid vertical={false} stroke="#2a2a34" strokeDasharray="3 3" />
                <XAxis
                  dataKey="label"
                  tick={{ fill: '#8b8b98', fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: '#2a2a34' }}
                  interval={range === 'month' ? 4 : 0}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: '#8b8b98', fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  width={32}
                />
                <Tooltip cursor={{ fill: 'rgba(124,92,255,0.08)' }} content={<ChartTooltip />} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={40}>
                  {insights.buckets.map((_, i) => (
                    <Cell key={i} fill={i === maxIdx ? BRAND_SOFT : BRAND} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <p className="px-1 text-center text-xs text-muted">
        Completed tasks are kept forever to power these insights. Your open list stays clean.
      </p>
    </div>
  )
}
