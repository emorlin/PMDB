import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { SignedIn } from '@clerk/clerk-react'
import AlphabetFilter from '../components/AlphabetFilter'
import PosterGrid from '../components/PosterGrid'
import AddMovieModal from '../components/AddMovieModal'
import { listMovies } from '../lib/movies'
import type { Movie } from '../types/movie'

const PAGE_SIZE = 48

function letterOf(title: string) {
  const c = title.trim()[0]?.toUpperCase() ?? '#'
  return /[A-ZÅÄÖ]/.test(c) ? c : '#'
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function DiscoverPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [all, setAll] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [onlyUnseen, setOnlyUnseen] = useState(false)
  const [randomOrder, setRandomOrder] = useState<Movie[] | null>(null)
  const [showAdd, setShowAdd] = useState(false)

  const letter = searchParams.get('letter')
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10) || 1)

  useEffect(() => {
    listMovies('title', 'asc')
      .then(setAll)
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const base = randomOrder ?? all
    return base.filter((m) => {
      if (onlyUnseen && m.my_rating !== null) return false
      if (!randomOrder && letter && letterOf(m.title) !== letter) return false
      return true
    })
  }, [all, randomOrder, letter, onlyUnseen])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  function goToPage(p: number) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (p > 1) next.set('page', String(p))
      else next.delete('page')
      return next
    })
  }

  function handleShuffle() {
    setRandomOrder(shuffle(all))
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.delete('letter')
      next.delete('page')
      return next
    })
  }

  function handleLetterSelect(l: string | null) {
    setRandomOrder(null)
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (l) next.set('letter', l)
      else next.delete('letter')
      next.delete('page')
      return next
    })
  }

  function handleOnlyUnseenChange(checked: boolean) {
    setOnlyUnseen(checked)
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.delete('page')
      return next
    })
  }

  return (
    <div>
      <h1 className="text-xl font-medium mb-4">Upptäck Filmer</h1>

      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <label className="flex items-center gap-2 text-sm min-h-11">
          <input
            type="checkbox"
            checked={onlyUnseen}
            onChange={(e) => handleOnlyUnseenChange(e.target.checked)}
          />
          Endast osedda
        </label>
        <div className="flex items-center gap-2">
          <button
            onClick={handleShuffle}
            className="rounded-md border border-border px-3 py-2 min-h-11 text-sm hover:bg-surface-2"
          >
            Slumpa filmer
          </button>
          <SignedIn>
            <button
              onClick={() => setShowAdd(true)}
              className="rounded-md bg-accent text-black px-3 py-2 min-h-11 text-sm font-medium"
            >
              + Lägg till film
            </button>
          </SignedIn>
        </div>
      </div>

      {loading ? (
        <div role="status" className="text-text-muted text-sm">
          Laddar...
        </div>
      ) : (
        <>
          <AlphabetFilter active={letter} onSelect={handleLetterSelect} disabled={!!randomOrder} />
          <PosterGrid movies={pageItems} />

          {totalPages > 1 && (
            <nav aria-label="Sidnumrering" className="flex items-center justify-center gap-3 mt-5 text-sm">
              <button
                onClick={() => goToPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="rounded-md border border-border px-3 py-1.5 min-h-11 disabled:opacity-40"
              >
                Föregående
              </button>
              <span aria-live="polite" className="text-text-muted">
                Sida {currentPage} av {totalPages}
              </span>
              <button
                onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="rounded-md border border-border px-3 py-1.5 min-h-11 disabled:opacity-40"
              >
                Nästa
              </button>
            </nav>
          )}
        </>
      )}

      {showAdd && (
        <AddMovieModal
          onClose={() => setShowAdd(false)}
          onAdded={(m) => {
            setAll((prev) => [...prev, m])
            navigate(`/movie/${m.id}`)
          }}
        />
      )}
    </div>
  )
}
