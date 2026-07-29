import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMovieDetails, posterUrl } from '../lib/tmdb'
import type { Movie } from '../types/movie'

interface Props {
  movies: Movie[]
}

export default function PosterGrid({ movies }: Props) {
  const navigate = useNavigate()
  const [posters, setPosters] = useState<Record<string, string | null>>({})

  useEffect(() => {
    let cancelled = false
    setPosters({})
    Promise.all(
      movies.map(async (m) => {
        if (m.tmdb_id == null) return [m.id, null] as const
        try {
          const d = await getMovieDetails(m.tmdb_id)
          return [m.id, posterUrl(d.poster_path)] as const
        } catch {
          return [m.id, null] as const
        }
      }),
    ).then((entries) => {
      if (cancelled) return
      setPosters(Object.fromEntries(entries))
    })
    return () => {
      cancelled = true
    }
  }, [movies])

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 flex-1">
      {movies.map((m) => (
        <button
          key={m.id}
          onClick={() => navigate(`/movie/${m.id}`)}
          className="text-left"
          title={m.title}
        >
          <div className="aspect-[2/3] bg-surface-2 border border-border rounded-md overflow-hidden flex items-center justify-center">
            {posters[m.id] ? (
              <img src={posters[m.id]!} alt={m.title} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs text-text-muted text-center px-1">Ingen poster</span>
            )}
          </div>
          <div className="text-xs mt-1 truncate text-text-muted">{m.title}</div>
        </button>
      ))}
      {movies.length === 0 && (
        <div className="col-span-full text-center text-text-muted text-sm py-10">
          Inga filmer matchar filtret.
        </div>
      )}
    </div>
  )
}
