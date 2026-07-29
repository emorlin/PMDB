const TMDB_BASE = 'https://api.themoviedb.org/3'
const apiKey = import.meta.env.VITE_TMDB_API_KEY

export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p'

function tmdbUrl(path: string, params: Record<string, string> = {}) {
  const url = new URL(TMDB_BASE + path)
  url.searchParams.set('api_key', apiKey ?? '')
  url.searchParams.set('language', 'sv-SE')
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  return url.toString()
}

export interface TmdbSearchResult {
  id: number
  title: string
  release_date: string
  poster_path: string | null
}

export async function searchMovies(query: string): Promise<TmdbSearchResult[]> {
  if (!query.trim()) return []
  const res = await fetch(tmdbUrl('/search/movie', { query, include_adult: 'false' }))
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
  const res = await fetch(
    tmdbUrl(`/movie/${tmdbId}`, { append_to_response: 'credits,external_ids' }),
  )
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
