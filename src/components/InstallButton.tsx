import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

/**
 * "Install app" chip. Appears only when the browser offers PWA installation
 * (Chrome/Edge/Android via `beforeinstallprompt`) and the app isn't already
 * installed. On iOS Safari the event never fires, so nothing shows and users
 * follow the guide's "Share → Add to Home Screen" instead.
 */
export function InstallButton({ className = '' }: { className?: string }) {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    const isStandalone =
      window.matchMedia?.('(display-mode: standalone)').matches ||
      (navigator as any).standalone === true
    if (isStandalone) return

    const onPrompt = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
    }
    const onInstalled = () => setDeferred(null)
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  if (!deferred) return null

  return (
    <button
      type="button"
      onClick={async () => {
        await deferred.prompt()
        await deferred.userChoice
        setDeferred(null)
      }}
      className={
        'rounded-full border border-ink bg-ink px-3 py-1.5 text-xs font-semibold text-white ' + className
      }
    >
      Install app
    </button>
  )
}
