export function StatTile({
  label,
  value,
  suffix,
}: {
  label: string
  value: string | number
  suffix?: string
}) {
  return (
    <div className="card flex flex-col gap-2 px-4 py-3.5">
      <span className="eyebrow">{label}</span>
      <span className="font-display text-2xl tabular-nums tracking-tight">
        {value}
        {suffix && <span className="ml-0.5 text-sm text-muted">{suffix}</span>}
      </span>
    </div>
  )
}
