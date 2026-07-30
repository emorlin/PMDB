import { supabase } from './supabase'
import type { Movie, MovieInsert, SortColumn, SortDirection } from '../types/movie'

const SELECT_WITH_LOCATION = '*, location:locations(name)'

// PostgREST svarar med max 1000 rader per anrop om man inte sidbryter själv –
// utan detta trunkeras samlingen tyst (filmer sorterade sist, t.ex. sent i
// alfabetet, försvinner helt ur listan).
const FETCH_PAGE_SIZE = 1000

// Hämtar hela samlingen en gång (se MoviesProvider – cachas i minnet och
// sidbryts inte om vid navigering). Sorteringsordning spelar ingen roll här,
// bara att .range() sidbryter deterministiskt – sortering sker i klienten
// med compareMovies() istället, så en sortändring aldrig kräver ett nytt anrop.
export async function listMovies(): Promise<Movie[]> {
  const movies: Movie[] = []
  let from = 0

  for (;;) {
    const { data, error } = await supabase
      .from('movies')
      .select(SELECT_WITH_LOCATION)
      .order('id', { ascending: true })
      .range(from, from + FETCH_PAGE_SIZE - 1)
    if (error) throw error
    const page = data as unknown as Movie[]
    movies.push(...page)
    if (page.length < FETCH_PAGE_SIZE) break
    from += FETCH_PAGE_SIZE
  }

  return movies
}

// Klientsidans motsvarighet till PostgRESTs .order() – all sortering sker nu
// i klienten mot den cachade listan (se MoviesProvider), så det spelar ingen
// roll att PostgREST inte kan sortera på ett embeddat fälts kolumn (location).
export function compareMovies(a: Movie, b: Movie, sort: SortColumn, dir: SortDirection): number {
  const dirMultiplier = dir === 'asc' ? 1 : -1

  if (sort === 'location') {
    const an = a.location?.name
    const bn = b.location?.name
    if (!an && !bn) return 0
    if (!an) return 1
    if (!bn) return -1
    return dirMultiplier * an.localeCompare(bn, 'sv')
  }

  const av = a[sort]
  const bv = b[sort]
  if (av == null && bv == null) return 0
  if (av == null) return 1
  if (bv == null) return -1
  if (typeof av === 'string' && typeof bv === 'string') {
    return dirMultiplier * av.localeCompare(bv, 'sv')
  }
  return dirMultiplier * ((av as number) - (bv as number))
}

export async function getMovie(id: string): Promise<Movie> {
  const { data, error } = await supabase
    .from('movies')
    .select(SELECT_WITH_LOCATION)
    .eq('id', id)
    .single()
  if (error) throw error
  return data as unknown as Movie
}

// Skrivoperationer går via /api/movies (inte direkt mot Supabase från klienten)
// eftersom de kräver inloggning – token kommer från Clerks useAuth().getToken().

export async function addMovie(movie: MovieInsert, token: string): Promise<Movie> {
  const res = await fetch('/api/movies', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(movie),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Kunde inte lägga till filmen')
  return data as Movie
}

export async function updateMovie(id: string, patch: Partial<MovieInsert>, token: string): Promise<Movie> {
  const res = await fetch(`/api/movies?id=${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(patch),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Kunde inte uppdatera filmen')
  return data as Movie
}

export async function deleteMovie(id: string, token: string): Promise<void> {
  const res = await fetch(`/api/movies?id=${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error ?? 'Kunde inte ta bort filmen')
  }
}
