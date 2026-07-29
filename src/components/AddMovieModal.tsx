import { useEffect, useState } from 'react'
import { searchMovies, getMovieDetails, posterUrl, type TmdbSearchResult } from '../lib/tmdb'
import { getImdbRating } from '../lib/omdb'
import { addMovie } from '../lib/movies'
import { listLocations } from '../lib/locations'
import type { Movie } from '../types/movie'
import type { Location } from '../types/location'

interface Props {
  onClose: () => void
  onAdded: (movie: Movie) => void
}

interface Selected {
  tmdb_id: number
  imdb_id: string
  title: string
  year: number | null
  runtime_minutes: number | null
  imdb_rating: number | null
  posterPath: string | null
}

export default function AddMovieModal({ onClose, onAdded }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<TmdbSearchResult[]>([])
  const [loadingResults, setLoadingResults] = useState(false)
  const [selected, setSelected] = useState<Selected | null>(null)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [locations, setLocations] = useState<Location[]>([])
  const [locationId, setLocationId] = useState('')
  const [myRating, setMyRating] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    listLocations()
      .then(setLocations)
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (selected || !query.trim()) {
      setResults([])
      return
    }
    const t = setTimeout(async () => {
      setLoadingResults(true)
      try {
        const r = await searchMovies(query)
        setResults(r.slice(0, 8))
      } catch (e) {
        setError((e as Error).message)
      } finally {
        setLoadingResults(false)
      }
    }, 300)
    return () => clearTimeout(t)
  }, [query, selected])

  async function pickResult(r: TmdbSearchResult) {
    setLoadingDetails(true)
    setError(null)
    try {
      const details = await getMovieDetails(r.id)
      let imdbRating: number | null = null
      if (details.imdb_id) {
        imdbRating = await getImdbRating(details.imdb_id)
      }
      setSelected({
        tmdb_id: details.id,
        imdb_id: details.imdb_id ?? '',
        title: details.title,
        year: details.release_date ? parseInt(details.release_date.slice(0, 4), 10) : null,
        runtime_minutes: details.runtime,
        imdb_rating: imdbRating,
        posterPath: details.poster_path,
      })
      setQuery(details.title)
      setResults([])
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoadingDetails(false)
    }
  }

  async function handleSave() {
    if (!selected) return
    setSaving(true)
    setError(null)
    try {
      const movie = await addMovie({
        tmdb_id: selected.tmdb_id,
        imdb_id: selected.imdb_id,
        title: selected.title,
        year: selected.year,
        runtime_minutes: selected.runtime_minutes,
        imdb_rating: selected.imdb_rating,
        my_rating: myRating ? parseInt(myRating, 10) : null,
        location_id: locationId || null,
      })
      onAdded(movie)
      onClose()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center px-4 z-50">
      <div className="bg-surface w-full max-w-md rounded-xl border border-border p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-medium">Lägg till film</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text" aria-label="Stäng">
            ✕
          </button>
        </div>

        {!selected && (
          <>
            <input
              autoFocus
              type="text"
              placeholder="Sök filmtitel..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-md bg-surface-2 border border-border px-3 py-2 text-sm outline-none focus:border-accent"
            />
            {(loadingResults || results.length > 0) && (
              <div className="mt-1 border border-border rounded-md overflow-hidden max-h-64 overflow-y-auto">
                {loadingResults && (
                  <div className="px-3 py-2 text-xs text-text-muted">Söker...</div>
                )}
                {results.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => pickResult(r)}
                    className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm hover:bg-surface-2 border-b border-border last:border-b-0"
                  >
                    <div className="w-8 h-11 flex-shrink-0 bg-surface-2 rounded overflow-hidden">
                      {posterUrl(r.poster_path, 'w92') && (
                        <img
                          src={posterUrl(r.poster_path, 'w92')!}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{r.title}</div>
                      <div className="text-xs text-text-muted">
                        {r.release_date ? r.release_date.slice(0, 4) : 'Okänt år'}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {loadingDetails && <div className="text-xs text-text-muted mt-2">Hämtar filminfo...</div>}

        {selected && (
          <div className="mt-2">
            <div className="text-xs text-text-muted mb-1">Automatiskt ifyllt</div>
            <div className="grid grid-cols-2 gap-2 text-xs mb-3">
              <div className="bg-surface-2 rounded-md px-2 py-1.5">{selected.title}</div>
              <div className="bg-surface-2 rounded-md px-2 py-1.5">
                {selected.year ?? '–'}
              </div>
              <div className="bg-surface-2 rounded-md px-2 py-1.5">
                {selected.runtime_minutes ? `${selected.runtime_minutes} min` : '–'}
              </div>
              <div className="bg-surface-2 rounded-md px-2 py-1.5">
                IMDb: {selected.imdb_rating ?? '–'}
              </div>
            </div>

            <div className="text-xs text-text-muted mb-1">Fyll i manuellt</div>
            <div className="grid grid-cols-2 gap-2 mb-4">
              <select
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                className="rounded-md bg-surface-2 border border-border px-2 py-1.5 text-sm outline-none focus:border-accent"
              >
                <option value="">Välj plats...</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={1}
                max={10}
                placeholder="Din rating (1-10)"
                value={myRating}
                onChange={(e) => setMyRating(e.target.value)}
                className="rounded-md bg-surface-2 border border-border px-2 py-1.5 text-sm outline-none focus:border-accent"
              />
            </div>
            {locations.length === 0 && (
              <div className="text-xs text-text-muted -mt-2 mb-4">
                Inga platser ännu – lägg till under Inställningar.
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setSelected(null)}
                className="flex-1 rounded-md border border-border py-2 text-sm hover:bg-surface-2"
              >
                Byt film
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 rounded-md bg-accent text-black py-2 text-sm font-medium disabled:opacity-50"
              >
                {saving ? 'Sparar...' : 'Spara film'}
              </button>
            </div>
          </div>
        )}

        {error && <div className="text-xs text-red-400 mt-3">{error}</div>}
      </div>
    </div>
  )
}
