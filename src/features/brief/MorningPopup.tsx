import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { PlayIcon } from '../../components/icons'

const KEY = 'gsd:brief-prompted'

/**
 * On the first open of the day, ask whether to play the daily brief.
 * Remembers the answer per calendar day (localStorage) so it isn't nagging.
 */
export function MorningPopup() {
  const [show, setShow] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10)
    let last: string | null = null
    try {
      last = localStorage.getItem(KEY)
    } catch {
      /* storage blocked — just show once this session */
    }
    if (last !== today) {
      const t = setTimeout(() => setShow(true), 500)
      return () => clearTimeout(t)
    }
  }, [])

  function remember() {
    try {
      localStorage.setItem(KEY, new Date().toISOString().slice(0, 10))
    } catch {
      /* ignore */
    }
  }

  function dismiss() {
    remember()
    setShow(false)
  }

  function briefMe() {
    remember()
    setShow(false)
    navigate('/brief', { state: { narrate: true } })
  }

  if (!show) return null

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-ink/55 p-6"
      role="dialog"
      aria-modal="true"
      onClick={dismiss}
    >
      <div
        className="w-full max-w-xs rounded-3xl bg-paper p-6 text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-3xl">☀️</div>
        <p className="eyebrow mt-2">{format(new Date(), 'EEEE · MMM d')}</p>
        <h2 className="mt-1.5 font-display text-2xl tracking-tight">Good morning</h2>
        <p className="mt-1.5 text-sm text-muted">
          Want your daily brief? Today's top stories across AI, tech, marketing, content and
          geopolitics — read aloud.
        </p>
        <div className="mt-5 flex flex-col gap-2">
          <button className="btn-primary" onClick={briefMe}>
            <PlayIcon className="h-4 w-4" /> Brief me now
          </button>
          <button className="text-sm text-muted hover:text-ink" onClick={dismiss}>
            Maybe later
          </button>
        </div>
      </div>
    </div>
  )
}
