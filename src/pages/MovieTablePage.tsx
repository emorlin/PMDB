import { useEffect, useState } from 'react'
import MovieTable from '../components/MovieTable'
import AddMovieModal from '../components/AddMovieModal'
import { listMovies } from '../lib/movies'
import type { Movie, SortColumn, SortDirection } from '../types/movie'

export default function MovieTablePage() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sort, setSort] = useState<SortColumn>('title')
  const [dir, setDir] = useState<SortDirection>('asc')
  const [showAdd, setShowAdd] = useState(false)

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

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-medium">Min filmsamling</h1>
        <button
          onClick={() => setShowAdd(true)}
          className="rounded-md bg-accent text-black px-3 py-1.5 text-sm font-medium"
        >
          + Lägg till film
        </button>
      </div>

      {error && <div className="text-sm text-red-400 mb-3">{error}</div>}
      {loading ? (
        <div className="text-text-muted text-sm">Laddar...</div>
      ) : (
        <MovieTable movies={movies} sort={sort} dir={dir} onSort={handleSort} />
      )}

      {showAdd && (
        <AddMovieModal
          onClose={() => setShowAdd(false)}
          onAdded={(m) => setMovies((prev) => [...prev, m])}
        />
      )}
    </div>
  )
}
