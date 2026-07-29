import { useEffect, useMemo, useState } from 'react'
import AlphabetFilter from '../components/AlphabetFilter'
import PosterGrid from '../components/PosterGrid'
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
  const [all, setAll] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [letter, setLetter] = useState<string | null>(null)
  const [onlyUnseen, setOnlyUnseen] = useState(false)
  const [randomOrder, setRandomOrder] = useState<Movie[] | null>(null)
  const [page, setPage] = useState(1)

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

  useEffect(() => {
    setPage(1)
  }, [letter, onlyUnseen, randomOrder])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function handleShuffle() {
    setRandomOrder(shuffle(all))
    setLetter(null)
  }

  function handleLetterSelect(l: string | null) {
    setRandomOrder(null)
    setLetter(l)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={onlyUnseen}
            onChange={(e) => setOnlyUnseen(e.target.checked)}
          />
          Endast osedda
        </label>
        <button
          onClick={handleShuffle}
          className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-surface-2"
        >
          Slumpa filmer
        </button>
      </div>

      {loading ? (
        <div className="text-text-muted text-sm">Laddar...</div>
      ) : (
        <>
          <AlphabetFilter active={letter} onSelect={handleLetterSelect} disabled={!!randomOrder} />
          <div className="flex gap-4">
            <PosterGrid movies={pageItems} />
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-5 text-sm">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-md border border-border px-3 py-1 disabled:opacity-40"
              >
                Föregående
              </button>
              <span className="text-text-muted">
                Sida {page} av {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-md border border-border px-3 py-1 disabled:opacity-40"
              >
                Nästa
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
