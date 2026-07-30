import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { listMovies } from './movies'
import type { Movie } from '../types/movie'

interface MoviesContextValue {
  movies: Movie[]
  loading: boolean
  error: string | null
  addMovieToCache: (movie: Movie) => void
  updateMovieInCache: (movie: Movie) => void
  removeMovieFromCache: (id: string) => void
}

const MoviesContext = createContext<MoviesContextValue | null>(null)

// Hela samlingen hämtas en gång här (AppLayout/App-nivå, överlever byte
// mellan flikar eftersom bara <Outlet /> byts ut, inte providern) och delas
// mellan Tabell-, Upptäck- och detaljsidan. En ny DB-hämtning behövs bara när
// en film faktiskt läggs till/ändras/tas bort – navigering mellan flikar
// eller byte av sorteringskolumn läser bara den redan hämtade listan.
export function MoviesProvider({ children }: { children: ReactNode }) {
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    listMovies()
      .then(setMovies)
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false))
  }, [])

  const addMovieToCache = useCallback((movie: Movie) => {
    setMovies((prev) => [...prev, movie])
  }, [])

  const updateMovieInCache = useCallback((movie: Movie) => {
    setMovies((prev) => prev.map((m) => (m.id === movie.id ? movie : m)))
  }, [])

  const removeMovieFromCache = useCallback((id: string) => {
    setMovies((prev) => prev.filter((m) => m.id !== id))
  }, [])

  return (
    <MoviesContext.Provider
      value={{ movies, loading, error, addMovieToCache, updateMovieInCache, removeMovieFromCache }}
    >
      {children}
    </MoviesContext.Provider>
  )
}

export function useMovies() {
  const ctx = useContext(MoviesContext)
  if (!ctx) throw new Error('useMovies måste användas inom MoviesProvider')
  return ctx
}
