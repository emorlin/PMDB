import { supabase } from './supabase'
import type { Movie, MovieInsert, SortColumn, SortDirection } from '../types/movie'

const SELECT_WITH_LOCATION = '*, location:locations(name)'

// PostgREST svarar med max 1000 rader per anrop om man inte sidbryter själv –
// utan detta trunkeras samlingen tyst (filmer sorterade sist, t.ex. sent i
// alfabetet, försvinner helt ur listan).
const FETCH_PAGE_SIZE = 1000

export async function listMovies(sort: SortColumn, dir: SortDirection): Promise<Movie[]> {
  const movies: Movie[] = []
  let from = 0

  for (;;) {
    let query = supabase.from('movies').select(SELECT_WITH_LOCATION)

    // PostgREST kan bara sortera föräldrarader på ett embeddat fälts kolumn om
    // relationen hämtas med !inner (en riktig join) – men det skulle utesluta
    // filmer utan plats ur listan helt. Sortera istället i klienten för "location".
    if (sort !== 'location') {
      query = query.order(sort, { ascending: dir === 'asc', nullsFirst: false })
    }
    // Sekundär sortering på id ger deterministisk ordning så att .range()
    // sidbryter stabilt istället för att riskera hoppa över eller dubblera rader.
    query = query.order('id', { ascending: true }).range(from, from + FETCH_PAGE_SIZE - 1)

    const { data, error } = await query
    if (error) throw error
    const page = data as unknown as Movie[]
    movies.push(...page)
    if (page.length < FETCH_PAGE_SIZE) break
    from += FETCH_PAGE_SIZE
  }

  if (sort === 'location') {
    const dirMultiplier = dir === 'asc' ? 1 : -1
    movies.sort((a, b) => {
      if (!a.location && !b.location) return 0
      if (!a.location) return 1
      if (!b.location) return -1
      return dirMultiplier * a.location.name.localeCompare(b.location.name, 'sv')
    })
  }

  return movies
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
