import { useEffect, useRef, useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
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

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export default function AddMovieModal({ onClose, onAdded }: Props) {
  const { getToken } = useAuth()
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

  const panelRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

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

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    searchInputRef.current?.focus()
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab') return
      const panel = panelRef.current
      if (!panel) return
      const focusable = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
        (el) => el.offsetParent !== null,
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

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
      const token = await getToken()
      if (!token) throw new Error('Du måste vara inloggad för att lägga till filmer.')
      const movie = await addMovie(
        {
          tmdb_id: selected.tmdb_id,
          imdb_id: selected.imdb_id,
          title: selected.title,
          year: selected.year,
          runtime_minutes: selected.runtime_minutes,
          imdb_rating: selected.imdb_rating,
          my_rating: myRating ? parseInt(myRating, 10) : null,
          location_id: locationId || null,
        },
        token,
      )
      onAdded(movie)
      onClose()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center px-4 z-50"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-movie-title"
        onClick={(e) => e.stopPropagation()}
        className="bg-surface w-full max-w-md max-h-[90vh] overflow-y-auto rounded-xl border border-border p-5"
      >
        <div className="flex items-center justify-between mb-3">
          <h2 id="add-movie-title" className="text-base font-medium">
            Lägg till film
          </h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text p-1.5 -m-1.5 rounded-md"
            aria-label="Stäng"
          >
            <span aria-hidden="true">✕</span>
          </button>
        </div>

        {!selected && (
          <>
            <label htmlFor="movie-search" className="sr-only">
              Sök filmtitel
            </label>
            <input
              ref={searchInputRef}
              id="movie-search"
              type="text"
              placeholder="Sök filmtitel..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-md bg-surface-2 border border-border px-3 py-2 text-sm focus:border-accent"
            />
            <div aria-live="polite">
              {(loadingResults || results.length > 0) && (
                <ul className="mt-1 border border-border rounded-md overflow-hidden max-h-64 overflow-y-auto">
                  {loadingResults && (
                    <li role="status" className="px-3 py-2 text-xs text-text-muted">
                      Söker...
                    </li>
                  )}
                  {results.map((r) => (
                    <li key={r.id} className="border-b border-border last:border-b-0">
                      <button
                        onClick={() => pickResult(r)}
                        className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm hover:bg-surface-2"
                      >
                        <span className="w-8 h-11 shrink-0 bg-surface-2 rounded overflow-hidden block">
                          {posterUrl(r.poster_path, 'w92') && (
                            <img
                              src={posterUrl(r.poster_path, 'w92')!}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          )}
                        </span>
                        <span>
                          <span className="font-medium block">{r.title}</span>
                          <span className="text-xs text-text-muted block">
                            {r.release_date ? r.release_date.slice(0, 4) : 'Okänt år'}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}

        {loadingDetails && (
          <div role="status" className="text-xs text-text-muted mt-2">
            Hämtar filminfo...
          </div>
        )}

        {selected && (
          <div className="mt-2">
            <div className="text-xs text-text-muted mb-1">Automatiskt ifyllt</div>
            <dl className="grid grid-cols-2 gap-2 text-xs mb-3">
              <div className="bg-surface-2 rounded-md px-2 py-1.5">
                <dt className="sr-only">Titel</dt>
                <dd>{selected.title}</dd>
              </div>
              <div className="bg-surface-2 rounded-md px-2 py-1.5">
                <dt className="sr-only">År</dt>
                <dd>{selected.year ?? '–'}</dd>
              </div>
              <div className="bg-surface-2 rounded-md px-2 py-1.5">
                <dt className="sr-only">Speltid</dt>
                <dd>{selected.runtime_minutes ? `${selected.runtime_minutes} min` : '–'}</dd>
              </div>
              <div className="bg-surface-2 rounded-md px-2 py-1.5">
                <dt className="sr-only">IMDb-rating</dt>
                <dd>IMDb: {selected.imdb_rating ?? '–'}</dd>
              </div>
            </dl>

            <div className="text-xs text-text-muted mb-1">Fyll i manuellt</div>
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div>
                <label htmlFor="movie-location" className="sr-only">
                  Plats
                </label>
                <select
                  id="movie-location"
                  value={locationId}
                  onChange={(e) => setLocationId(e.target.value)}
                  className="w-full rounded-md bg-surface-2 border border-border px-2 py-1.5 text-sm focus:border-accent"
                >
                  <option value="">Välj plats...</option>
                  {locations.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="movie-rating" className="sr-only">
                  Din rating, 1 till 10
                </label>
                <input
                  id="movie-rating"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={10}
                  placeholder="Din rating (1-10)"
                  value={myRating}
                  onChange={(e) => setMyRating(e.target.value)}
                  className="w-full rounded-md bg-surface-2 border border-border px-2 py-1.5 text-sm focus:border-accent"
                />
              </div>
            </div>
            {locations.length === 0 && (
              <div className="text-xs text-text-muted -mt-2 mb-4">
                Inga platser ännu – lägg till under Inställningar.
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setSelected(null)}
                className="flex-1 rounded-md border border-border py-2 min-h-11 text-sm hover:bg-surface-2"
              >
                Byt film
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 rounded-md bg-accent text-black py-2 min-h-11 text-sm font-medium disabled:opacity-50"
              >
                {saving ? 'Sparar...' : 'Spara film'}
              </button>
            </div>
          </div>
        )}

        {error && (
          <div role="alert" className="text-xs text-danger mt-3">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}
