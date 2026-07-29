import { NavLink, Outlet } from 'react-router-dom'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-1.5 rounded-md text-sm ${
    isActive ? 'bg-surface-2 text-text' : 'text-text-muted hover:text-text'
  }`

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-bg text-text">
      <header className="border-b border-border">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-3">
          <span className="font-medium">Min filmsamling</span>
          <nav className="flex gap-1">
            <NavLink to="/" end className={linkClass}>
              Tabell
            </NavLink>
            <NavLink to="/discover" className={linkClass}>
              Upptäck
            </NavLink>
            <NavLink to="/admin" className={linkClass}>
              Inställningar
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-6">
        <Outlet />
      </main>
    </div>
  )
}
