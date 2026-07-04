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

const INK = '#0E0E0E'
const GRID = '#EAEAE8'
const AXIS = '#9B9B9B'

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const count = payload[0].value as number
  return (
    <div className="rounded-lg bg-ink px-3 py-2 text-xs text-white shadow-lg">
      <div className="font-semibold">{label}</div>
      <div className="text-white/70">
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
        <h1 className="font-display text-3xl tracking-tight">Insights</h1>
        <p className="mt-1 text-sm text-muted">How much you're getting done.</p>
      </header>

      <div className="grid grid-cols-2 gap-3">
        <StatTile label="Current streak" value={insights.streak} suffix={insights.streak === 1 ? 'day' : 'days'} />
        <StatTile label={`Done ${rangeLabel}`} value={insights.completedInRange} />
        <StatTile label="Completion rate" value={insights.completionRate} suffix="%" />
        <StatTile label="Still open" value={insights.activeCount} />
      </div>

      <div className="card flex flex-col gap-4 p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-[15px]">Completed</h2>
          <div className="flex gap-0.5 rounded-lg border border-line bg-paper-2 p-0.5">
            {RANGES.map((r) => (
              <button
                key={r.key}
                type="button"
                onClick={() => setRange(r.key)}
                className={
                  'rounded-md px-3 py-1 font-mono text-[11px] transition-colors ' +
                  (range === r.key ? 'bg-ink text-white' : 'text-muted hover:text-ink')
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
                <CartesianGrid vertical={false} stroke={GRID} strokeDasharray="3 3" />
                <XAxis
                  dataKey="label"
                  tick={{ fill: AXIS, fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: GRID }}
                  interval={range === 'month' ? 4 : 0}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: AXIS, fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  width={32}
                />
                <Tooltip cursor={{ fill: 'rgba(14,14,14,0.06)' }} content={<ChartTooltip />} />
                <Bar dataKey="count" radius={[3, 3, 0, 0]} maxBarSize={18}>
                  {insights.buckets.map((_, i) => (
                    <Cell key={i} fill={i === maxIdx ? INK : '#0E0E0E'} fillOpacity={i === maxIdx ? 1 : 0.82} />
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
