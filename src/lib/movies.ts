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

export async function addMovie(movie: MovieInsert): Promise<Movie> {
  const { data, error } = await supabase
    .from('movies')
    .insert(movie)
    .select(SELECT_WITH_LOCATION)
    .single()
  if (error) throw error
  return data as unknown as Movie
}

export async function updateMovie(id: string, patch: Partial<MovieInsert>): Promise<Movie> {
  const { data, error } = await supabase
    .from('movies')
    .update(patch)
    .eq('id', id)
    .select(SELECT_WITH_LOCATION)
    .single()
  if (error) throw error
  return data as unknown as Movie
}

export async function deleteMovie(id: string): Promise<void> {
  const { error } = await supabase.from('movies').delete().eq('id', id)
  if (error) throw error
}
