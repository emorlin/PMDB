import { useEffect, useState, type Dispatch, type SetStateAction } from 'react'
import { searchMovies, type TmdbSearchResult } from '../lib/tmdb'

// Debounce på 300ms, max 8 resultat – hålls i en delad hook eftersom
// AddMovieModal och MatchMovieModal annars skulle duplicera exakt samma
// sök-/felhantering.
export function useTmdbSearch(
  query: string,
  year: string,
  active: boolean,
  setError: Dispatch<SetStateAction<string | null>>,
) {
  const [results, setResults] = useState<TmdbSearchResult[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!active || !query.trim()) {
      setResults([])
      return
    }
    const t = setTimeout(async () => {
      setLoading(true)
      try {
        const r = await searchMovies(query, year)
        setResults(r.slice(0, 8))
      } catch (e) {
        setError((e as Error).message)
      } finally {
        setLoading(false)
      }
    }, 300)
    return () => clearTimeout(t)
  }, [query, year, active, setError])

  return { results, loading, setResults }
}
