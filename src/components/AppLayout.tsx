import { NavLink, Outlet } from 'react-router-dom'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center min-h-11 px-3 py-2 rounded-md text-sm ${
    isActive ? 'bg-surface-2 text-text' : 'text-text-muted hover:text-text'
  }`

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-bg text-text">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-2 focus:left-2 focus:rounded-md focus:bg-accent focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-black"
      >
        Hoppa till innehåll
      </a>
      <header className="border-b border-border">
        <div className="mx-auto max-w-6xl flex flex-wrap items-center justify-between gap-2 px-4 sm:px-6 py-2 sm:py-3">
          <span className="font-medium">Mathias filmsamling</span>
          <nav aria-label="Huvudmeny" className="flex flex-wrap gap-1">
            <NavLink to="/" end className={linkClass}>
              Tabell
            </NavLink>
            <NavLink to="/discover" className={linkClass}>
              Upptäck
            </NavLink>
            <NavLink to="/admin" className={linkClass}>
              Inställningar
            </NavLink>
            <NavLink to="/om" className={linkClass}>
              Om
            </NavLink>
          </nav>
        </div>
      </header>
      <main id="main-content" tabIndex={-1} className="mx-auto max-w-6xl px-4 sm:px-6 py-6">
        <Outlet />
      </main>
    </div>
  )
}
