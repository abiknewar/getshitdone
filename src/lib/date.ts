import { format, isPast, isToday as _isToday, parseISO, startOfDay } from 'date-fns'

/** yyyy-mm-dd for today, in the user's local timezone. */
export function todayISO(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

export function isToday(due: string | null): boolean {
  if (!due) return false
  return _isToday(parseISO(due))
}

/** A dated task is overdue if its day is strictly before today. */
export function isOverdue(due: string | null): boolean {
  if (!due) return false
  const day = startOfDay(parseISO(due))
  return isPast(day) && !_isToday(day)
}

/** Friendly label for a due date, e.g. "Today", "Overdue · Jul 2", "Jul 9". */
export function formatDue(due: string | null): string | null {
  if (!due) return null
  const day = parseISO(due)
  if (_isToday(day)) return 'Today'
  const label = format(day, 'MMM d')
  return isOverdue(due) ? `Overdue · ${label}` : label
}
