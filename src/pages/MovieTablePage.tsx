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

  const filteredMovies = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return movies
    return movies.filter((m) => m.title.toLowerCase().includes(q))
  }, [movies, query])

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h1 className="text-lg font-medium">Min filmsamling</h1>
        <button
          onClick={() => setShowAdd(true)}
          className="rounded-md bg-accent text-black px-3 py-2 min-h-11 text-sm font-medium"
        >
          + Lägg till film
        </button>
      </div>

      <div className="mb-4">
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
        {query.trim() && (
          <div aria-live="polite" className="text-xs text-text-muted mt-1">
            {filteredMovies.length} {filteredMovies.length === 1 ? 'film' : 'filmer'} matchar
          </div>
        )}
      </div>

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
            query.trim() ? 'Inga filmer matchar sökningen.' : 'Inga filmer ännu. Lägg till din första film.'
          }
        />
      )}

      {showAdd && (
        <AddMovieModal onClose={() => setShowAdd(false)} onAdded={(m) => navigate(`/movie/${m.id}`)} />
      )}
    </div>
  )
}
