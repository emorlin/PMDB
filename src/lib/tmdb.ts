import { proxyHeaders } from './proxy'

// Alla anrop går via våra egna /api-proxyer (se /api/tmdb-*.ts) så att
// TMDB-nyckeln aldrig behöver finnas i webbläsaren.

export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p'

export interface TmdbSearchResult {
  id: number
  title: string
  release_date: string
  poster_path: string | null
}

export async function searchMovies(query: string): Promise<TmdbSearchResult[]> {
  if (!query.trim()) return []
  const url = `/api/tmdb-search?query=${encodeURIComponent(query)}`
  const res = await fetch(url, { headers: proxyHeaders() })
  if (!res.ok) throw new Error('TMDB-sökning misslyckades')
  const data = await res.json()
  return data.results ?? []
}

export interface TmdbMovieDetails {
  id: number
  title: string
  release_date: string
  runtime: number | null
  poster_path: string | null
  overview: string
  genres: { id: number; name: string }[]
  imdb_id: string | null
  credits: {
    crew: { job: string; name: string }[]
    cast: { name: string; order: number }[]
  }
}

export async function getMovieDetails(tmdbId: number): Promise<TmdbMovieDetails> {
  const url = `/api/tmdb-movie?id=${tmdbId}`
  const res = await fetch(url, { headers: proxyHeaders() })
  if (!res.ok) throw new Error('Kunde inte hämta filmdetaljer från TMDB')
  const data = await res.json()
  return {
    ...data,
    imdb_id: data.imdb_id ?? data.external_ids?.imdb_id ?? null,
  }
}

export function posterUrl(path: string | null, size: 'w92' | 'w185' | 'w342' | 'w500' = 'w342') {
  if (!path) return null
  return `${TMDB_IMAGE_BASE}/${size}${path}`
}
