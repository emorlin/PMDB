import { NavLink, Link, Outlet } from 'react-router-dom'
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react'
import { useTheme } from '../lib/theme-context'

const GITHUB_URL = 'https://github.com/emorlin/PMDB'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center min-h-11 px-3 py-2 rounded-md text-sm ${
    isActive ? 'bg-surface-2 text-text' : 'text-text-muted hover:text-text'
  }`

export default function AppLayout() {
  const { theme } = useTheme()

  const year = new Date().getFullYear()

  return (
    <div className="min-h-screen flex flex-col bg-bg text-text">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-2 focus:left-2 focus:rounded-md focus:bg-accent focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-black"
      >
        Hoppa till innehåll
      </a>
      <header className="border-b border-border">
        <div className="mx-auto max-w-6xl flex flex-wrap items-center justify-between gap-2 px-4 sm:px-6 py-2 sm:py-3">
          <Link to="/" className="flex items-center rounded-md focus-visible:outline-offset-4">
            <img
              src={theme === 'dark' ? '/logo-dark.png' : '/logo.png'}
              alt="Mathias Filmsamling"
              className="h-9 w-auto"
            />
          </Link>
          <div className="flex flex-wrap items-center gap-2">
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
            <SignedIn>
              <UserButton />
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="rounded-md border border-border px-3 py-2 min-h-11 text-sm hover:bg-surface-2">
                  Logga in
                </button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>
      </header>
      <main id="main-content" tabIndex={-1} className="flex-1 mx-auto max-w-6xl px-4 sm:px-6 py-6 w-full">
        <Outlet />
      </main>
      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4">
          <blockquote className="text-xs text-text-muted italic text-center sm:text-left max-w-lg">
            <p>
              “The length of a film should be directly related to the endurance of the human
              bladder.”
            </p>
            <p className="not-italic mt-1">― Alfred Hitchcock</p>
          </blockquote>
          <div className="flex flex-col items-center sm:items-end gap-2">
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="currentColor"
                aria-hidden="true"
                className="shrink-0"
              >
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
              </svg>
              GitHub
              <span className="sr-only"> (öppnas i ny flik)</span>
            </a>
            <p className="text-xs text-text-muted">© {year} Mathias Filmsamling</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
