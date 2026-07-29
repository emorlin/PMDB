import { supabase } from './supabase'
import type { Movie, MovieInsert, SortColumn, SortDirection } from '../types/movie'

const SELECT_WITH_LOCATION = '*, location:locations(name)'

export async function listMovies(sort: SortColumn, dir: SortDirection): Promise<Movie[]> {
  let query = supabase.from('movies').select(SELECT_WITH_LOCATION)

  if (sort === 'location') {
    query = query.order('name', { foreignTable: 'locations', ascending: dir === 'asc' })
  } else {
    query = query.order(sort, { ascending: dir === 'asc', nullsFirst: false })
  }

  const { data, error } = await query
  if (error) throw error
  return data as unknown as Movie[]
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
