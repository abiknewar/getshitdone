import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'

type ToastKind = 'info' | 'success' | 'error'
interface ToastMsg {
  id: number
  text: string
  kind: ToastKind
}

const ToastContext = createContext<(text: string, kind?: ToastKind) => void>(() => {})

let nextId = 1

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMsg[]>([])

  const show = useCallback((text: string, kind: ToastKind = 'info') => {
    const id = nextId++
    setToasts((t) => [...t, { id, text, kind }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200)
  }, [])

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex flex-col items-center gap-2 px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={
              'pointer-events-auto max-w-sm rounded-xl px-4 py-2.5 text-sm shadow-lg ' +
              (t.kind === 'error'
                ? 'bg-bad/90 text-white'
                : t.kind === 'success'
                  ? 'bg-good/90 text-black'
                  : 'bg-surface-2 text-text border border-border')
            }
          >
            {t.text}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
