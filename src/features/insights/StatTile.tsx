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
    <div className="card flex flex-col gap-1 px-4 py-3">
      <span className="pixel-label text-[10px] text-muted">{label}</span>
      <span className="text-2xl font-bold tabular-nums">
        {value}
        {suffix && <span className="ml-0.5 text-base font-medium text-muted">{suffix}</span>}
      </span>
    </div>
  )
}
