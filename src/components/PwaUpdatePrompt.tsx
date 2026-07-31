import { useRegisterSW } from 'virtual:pwa-register/react'

export default function PwaUpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  if (!needRefresh) return null

  return (
    <div
      role="status"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-md border border-border bg-surface-2 px-4 py-3 text-sm shadow-lg"
    >
      <span>En ny version av appen finns tillgänglig.</span>
      <button
        onClick={() => updateServiceWorker(true)}
        className="rounded-md bg-accent text-black px-3 py-2 min-h-11 text-sm font-medium"
      >
        Uppdatera
      </button>
      <button
        onClick={() => setNeedRefresh(false)}
        aria-label="Stäng"
        className="min-h-11 min-w-11 flex items-center justify-center text-text-muted hover:text-text"
      >
        ✕
      </button>
    </div>
  )
}
