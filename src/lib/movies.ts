import { supabase } from './supabase'
import type { Movie, MovieInsert, SortColumn, SortDirection } from '../types/movie'

export async function listMovies(sort: SortColumn, dir: SortDirection): Promise<Movie[]> {
  const { data, error } = await supabase
    .from('movies')
    .select('*')
    .order(sort, { ascending: dir === 'asc', nullsFirst: false })
  if (error) throw error
  return data as Movie[]
}

export async function getMovie(id: string): Promise<Movie> {
  const { data, error } = await supabase.from('movies').select('*').eq('id', id).single()
  if (error) throw error
  return data as Movie
}

export async function addMovie(movie: MovieInsert): Promise<Movie> {
  const { data, error } = await supabase.from('movies').insert(movie).select().single()
  if (error) throw error
  return data as Movie
}

export async function updateMovie(id: string, patch: Partial<MovieInsert>): Promise<Movie> {
  const { data, error } = await supabase
    .from('movies')
    .update(patch)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Movie
}

export async function deleteMovie(id: string): Promise<void> {
  const { error } = await supabase.from('movies').delete().eq('id', id)
  if (error) throw error
}
