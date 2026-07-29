export interface Movie {
  id: string
  user_id: string
  tmdb_id: number
  imdb_id: string
  title: string
  year: number | null
  runtime_minutes: number | null
  my_rating: number | null // 1-10, null = unseen
  imdb_rating: number | null
  location: string | null
  created_at: string
}

export type MovieInsert = Omit<Movie, 'id' | 'user_id' | 'created_at'>

export type SortColumn = 'title' | 'year' | 'my_rating' | 'imdb_rating' | 'runtime_minutes' | 'location'
export type SortDirection = 'asc' | 'desc'
