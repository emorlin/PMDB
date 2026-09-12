import { useEffect, useRef, useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { getMovieDetails, type TmdbSearchResult } from '../lib/tmdb'
import { getImdbRating } from '../lib/omdb'
import { updateMovie } from '../lib/movies'
import { useTmdbSearch } from '../hooks/useTmdbSearch'
import TmdbSearchBox from './TmdbSearchBox'
import type { Movie } from '../types/movie'

interface Props {
  movie: Movie
  onClose: () => void
  onMatched: (movie: Movie) => void
}

interface Selected {
  tmdb_id: number
  imdb_id: string
  title: string
  year: number | null
  runtime_minutes: number | null
  imdb_rating: number | null
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export default function MatchMovieModal({ movie, onClose, onMatched }: Props) {
  const { getToken } = useAuth()
  const [query, setQuery] = useState(movie.title)
  const [year, setYear] = useState(movie.year ? String(movie.year) : '')
  const [selected, setSelected] = useState<Selected | null>(null)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const panelRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const { results, loading: loadingResults, setResults } = useTmdbSearch(query, year, !selected, setError)

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    searchInputRef.current?.focus()
    searchInputRef.current?.select()
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
      })
      setQuery(details.title)
      setResults([])
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoadingDetails(false)
    }
  }

  async function handleConfirm() {
    if (!selected) return
    setSaving(true)
    setError(null)
    try {
      const token = await getToken()
      if (!token) throw new Error('Du måste vara inloggad för att matcha filmer.')
      const updated = await updateMovie(
        movie.id,
        {
          tmdb_id: selected.tmdb_id,
          imdb_id: selected.imdb_id,
          imdb_rating: selected.imdb_rating,
        },
        token,
      )
      onMatched(updated)
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
        aria-labelledby="match-movie-title"
        onClick={(e) => e.stopPropagation()}
        className="bg-surface w-full max-w-md max-h-[90vh] overflow-y-auto rounded-xl border border-border p-5"
      >
        <div className="flex items-center justify-between mb-1">
          <h2 id="match-movie-title" className="text-base font-medium">
            Matcha mot TMDB
          </h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text p-1.5 -m-1.5 rounded-md"
            aria-label="Stäng"
          >
            <span aria-hidden="true">✕</span>
          </button>
        </div>
        <p className="text-xs text-text-muted mb-3">
          "{movie.title}" saknar TMDB/IMDb-koppling. Sök upp rätt film nedan för att hämta handling,
          skådespelare, genre och IMDb-rating.
        </p>

        {!selected && (
          <TmdbSearchBox
            idPrefix="match"
            query={query}
            onQueryChange={setQuery}
            year={year}
            onYearChange={setYear}
            results={results}
            loading={loadingResults}
            onPick={pickResult}
            searchInputRef={searchInputRef}
          />
        )}

        {loadingDetails && (
          <div role="status" className="text-xs text-text-muted mt-2">
            Hämtar filminfo...
          </div>
        )}

        {selected && (
          <div className="mt-2">
            <div className="text-xs text-text-muted mb-1">Vald film</div>
            <dl className="grid grid-cols-2 gap-2 text-xs mb-4">
              <div className="bg-surface-2 rounded-md px-2 py-1.5 col-span-2">
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
              <div className="bg-surface-2 rounded-md px-2 py-1.5 col-span-2">
                <dt className="sr-only">IMDb-rating</dt>
                <dd>IMDb: {selected.imdb_rating ?? '–'}</dd>
              </div>
            </dl>

            <div className="flex gap-2">
              <button
                onClick={() => setSelected(null)}
                className="flex-1 rounded-md border border-border py-2 min-h-11 text-sm hover:bg-surface-2"
              >
                Byt film
              </button>
              <button
                onClick={handleConfirm}
                disabled={saving}
                className="flex-1 rounded-md bg-accent text-black py-2 min-h-11 text-sm font-medium disabled:opacity-50"
              >
                {saving ? 'Sparar...' : 'Använd denna film'}
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
