import { useEffect } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'

/**
 * Shows a banner when a new version has been deployed, so the installed app
 * can be refreshed into the latest features with one tap. Also flashes a brief
 * "ready to work offline" note the first time the service worker caches.
 *
 * Rendered above the auth gate so updates apply even on the login screen.
 */
export function UpdatePrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  // Auto-dismiss the offline-ready note after a few seconds.
  useEffect(() => {
    if (!offlineReady) return
    const t = setTimeout(() => setOfflineReady(false), 3000)
    return () => clearTimeout(t)
  }, [offlineReady, setOfflineReady])

  if (needRefresh) {
    return (
      <div className="fixed inset-x-0 bottom-0 z-[60] flex justify-center px-4 pb-[calc(env(safe-area-inset-bottom)+16px)] pt-4">
        <div className="flex w-full max-w-md items-center gap-3 rounded-2xl bg-ink px-4 py-3 text-white shadow-2xl">
          <div className="min-w-0 flex-1">
            <div className="font-display text-[15px] leading-tight">New version available</div>
            <div className="text-xs text-white/60">Refresh to get the latest.</div>
          </div>
          <button
            type="button"
            onClick={() => updateServiceWorker(true)}
            className="flex-none rounded-lg bg-white px-3.5 py-2 text-sm font-semibold text-ink"
          >
            Update
          </button>
          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => setNeedRefresh(false)}
            className="flex-none px-1 text-white/50 hover:text-white"
          >
            ✕
          </button>
        </div>
      </div>
    )
  }

  if (offlineReady) {
    return (
      <div className="fixed inset-x-0 bottom-0 z-[60] flex justify-center px-4 pb-[calc(env(safe-area-inset-bottom)+16px)] pt-4">
        <div className="rounded-xl bg-ink px-4 py-2.5 text-sm text-white shadow-lg">
          Ready to work offline ✓
        </div>
      </div>
    )
  }

  return null
}
