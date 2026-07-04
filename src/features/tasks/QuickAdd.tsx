import { useState } from 'react'

interface Props {
  onAdd: (title: string) => void
  placeholder?: string
}

export function QuickAdd({ onAdd, placeholder = 'Add a task…' }: Props) {
  const [value, setValue] = useState('')

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const clean = value.trim()
    if (!clean) return
    onAdd(clean)
    setValue('')
  }

  return (
    <form onSubmit={submit} className="flex gap-2">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="input"
      />
      <button type="submit" className="btn-primary px-5" disabled={!value.trim()}>
        Add
      </button>
    </form>
  )
}
