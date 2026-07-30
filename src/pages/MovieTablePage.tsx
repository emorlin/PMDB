import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MovieTable from '../components/MovieTable'
import AddMovieModal from '../components/AddMovieModal'
import { listMovies } from '../lib/movies'
import type { Movie, SortColumn, SortDirection } from '../types/movie'

export default function MovieTablePage() {
  const navigate = useNavigate()
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sort, setSort] = useState<SortColumn>('title')
  const [dir, setDir] = useState<SortDirection>('asc')
  const [showAdd, setShowAdd] = useState(false)
  const [query, setQuery] = useState('')
  const [onlyUnseen, setOnlyUnseen] = useState(false)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      setMovies(await listMovies(sort, dir))
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort, dir])

  function handleSort(col: SortColumn) {
    if (col === sort) {
      setDir(dir === 'asc' ? 'desc' : 'asc')
    } else {
      setSort(col)
      setDir('asc')
    }
  }

  const unseenCount = useMemo(() => movies.filter((m) => m.my_rating === null).length, [movies])

  const filteredMovies = useMemo(() => {
    const q = query.trim().toLowerCase()
    return movies.filter((m) => {
      if (onlyUnseen && m.my_rating !== null) return false
      if (q && !m.title.toLowerCase().includes(q)) return false
      return true
    })
  }, [movies, query, onlyUnseen])

  const filterActive = query.trim() !== '' || onlyUnseen

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h1 className="text-xl font-medium">Mathias Filmsamling</h1>
        <button
          onClick={() => setShowAdd(true)}
          className="rounded-md bg-accent text-black px-3 py-2 min-h-11 text-sm font-medium"
        >
          + Lägg till film
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="rounded-md bg-surface-2 border border-border px-4 py-2">
          <div className="text-xs text-text-muted">Filmer</div>
          <div className="text-lg font-medium">{movies.length}</div>
        </div>
        <div className="rounded-md bg-surface-2 border border-border px-4 py-2">
          <div className="text-xs text-text-muted">Osedda</div>
          <div className="text-lg font-medium">{unseenCount}</div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-1">
        <div className="flex-1 min-w-40">
          <label htmlFor="movie-search" className="sr-only">
            Sök på titel
          </label>
          <input
            id="movie-search"
            type="search"
            placeholder="Sök på titel..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-md bg-surface-2 border border-border px-3 py-2 text-sm focus:border-accent"
          />
        </div>
        <label className="flex items-center gap-2 text-sm min-h-11 whitespace-nowrap">
          <input
            type="checkbox"
            checked={onlyUnseen}
            onChange={(e) => setOnlyUnseen(e.target.checked)}
          />
          Endast osedda
        </label>
      </div>
      {filterActive && (
        <div aria-live="polite" className="text-xs text-text-muted mb-3">
          Visar {filteredMovies.length} av {movies.length} filmer
        </div>
      )}

      {error && (
        <div role="alert" className="text-sm text-danger mb-3">
          {error}
        </div>
      )}
      {loading ? (
        <div role="status" className="text-text-muted text-sm">
          Laddar...
        </div>
      ) : (
        <MovieTable
          movies={filteredMovies}
          sort={sort}
          dir={dir}
          onSort={handleSort}
          emptyMessage={
            filterActive ? 'Inga filmer matchar filtreringen.' : 'Inga filmer ännu. Lägg till din första film.'
          }
        />
      )}

      {showAdd && (
        <AddMovieModal onClose={() => setShowAdd(false)} onAdded={(m) => navigate(`/movie/${m.id}`)} />
      )}
    </div>
  )
}
