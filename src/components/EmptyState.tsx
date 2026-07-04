export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="card flex flex-col items-center gap-1 px-6 py-10 text-center">
      <p className="font-medium">{title}</p>
      {hint && <p className="max-w-xs text-sm text-muted">{hint}</p>}
    </div>
  )
}
