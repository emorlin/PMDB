import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getMovie, deleteMovie, updateMovie } from '../lib/movies'
import { getMovieDetails, posterUrl, type TmdbMovieDetails } from '../lib/tmdb'
import { listLocations } from '../lib/locations'
import MatchMovieModal from '../components/MatchMovieModal'
import type { Movie } from '../types/movie'
import type { Location } from '../types/location'

function formatRuntime(min: number | null) {
  if (!min) return '–'
  const h = Math.floor(min / 60)
  const m = min % 60
  return `${h}h ${m.toString().padStart(2, '0')}min`
}

export default function MovieDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [movie, setMovie] = useState<Movie | null>(null)
  const [tmdb, setTmdb] = useState<TmdbMovieDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [editRating, setEditRating] = useState('')
  const [editLocationId, setEditLocationId] = useState('')
  const [locations, setLocations] = useState<Location[]>([])
  const [saving, setSaving] = useState(false)
  const [showMatchModal, setShowMatchModal] = useState(false)

  useEffect(() => {
    listLocations()
      .then(setLocations)
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError(null)
    setTmdb(null)
    getMovie(id)
      .then((m) => {
        setMovie(m)
        setShowMatchModal(m.tmdb_id == null)
      })
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (movie?.tmdb_id == null) {
      setTmdb(null)
      return
    }
    let cancelled = false
    getMovieDetails(movie.tmdb_id)
      .then((details) => {
        if (!cancelled) setTmdb(details)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [movie?.tmdb_id])

  async function handleDelete() {
    if (!movie) return
    if (!confirm(`Ta bort "${movie.title}" från samlingen?`)) return
    await deleteMovie(movie.id)
    navigate('/')
  }

  function startEdit() {
    if (!movie) return
    setEditRating(movie.my_rating?.toString() ?? '')
    setEditLocationId(movie.location_id ?? '')
    setEditing(true)
  }

  async function handleSaveEdit() {
    if (!movie) return
    setSaving(true)
    try {
      const updated = await updateMovie(movie.id, {
        my_rating: editRating ? parseInt(editRating, 10) : null,
        location_id: editLocationId || null,
      })
      setMovie(updated)
      setEditing(false)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  if (loading)
    return (
      <div role="status" className="text-text-muted text-sm">
        Laddar...
      </div>
    )
  if (error)
    return (
      <div role="alert" className="text-danger text-sm">
        {error}
      </div>
    )
  if (!movie) return null

  const director = tmdb?.credits.crew.find((c) => c.job === 'Director')
  const cast = tmdb?.credits.cast.slice(0, 6) ?? []

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
        <div className="w-36 h-52 mx-auto sm:mx-0 shrink-0 bg-surface-2 rounded-lg border border-border overflow-hidden flex items-center justify-center">
          {tmdb && posterUrl(tmdb.poster_path) ? (
            <img
              src={posterUrl(tmdb.poster_path)!}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-xs text-text-muted text-center px-2">Ingen poster</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-medium">{movie.title}</h1>
          <div className="text-sm text-text-muted mt-1 mb-3">
            {movie.year ?? '–'} · {formatRuntime(movie.runtime_minutes)}
            {tmdb && tmdb.genres.length > 0 && ' · ' + tmdb.genres.map((g) => g.name).join(', ')}
          </div>
          {movie.tmdb_id == null && (
            <div className="flex items-center gap-2 flex-wrap text-xs text-text-muted bg-surface-2 border border-border rounded-md px-2 py-1.5 mb-3">
              <span>Inte matchad mot TMDB ännu – handling, skådespelare och genre saknas.</span>
              <button
                onClick={() => setShowMatchModal(true)}
                className="rounded-md border border-border px-2 py-1.5 min-h-8 text-xs text-text hover:bg-surface"
              >
                Matcha mot TMDB
              </button>
            </div>
          )}

          {editing ? (
            <div className="flex flex-wrap gap-3 mb-3 items-end">
              <div>
                <label htmlFor="edit-rating" className="block text-xs text-text-muted mb-1">
                  Min rating
                </label>
                <input
                  id="edit-rating"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={10}
                  value={editRating}
                  onChange={(e) => setEditRating(e.target.value)}
                  className="w-20 rounded-md bg-surface-2 border border-border px-2 py-1.5 text-sm focus:border-accent"
                />
              </div>
              <div>
                <label htmlFor="edit-location" className="block text-xs text-text-muted mb-1">
                  Placering
                </label>
                <select
                  id="edit-location"
                  value={editLocationId}
                  onChange={(e) => setEditLocationId(e.target.value)}
                  className="w-36 rounded-md bg-surface-2 border border-border px-2 py-1.5 text-sm focus:border-accent"
                >
                  <option value="">Ingen</option>
                  {locations.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleSaveEdit}
                disabled={saving}
                className="rounded-md bg-accent text-black px-3 py-2 min-h-11 text-sm font-medium disabled:opacity-50"
              >
                {saving ? 'Sparar...' : 'Spara'}
              </button>
              <button
                onClick={() => setEditing(false)}
                className="rounded-md border border-border px-3 py-2 min-h-11 text-sm"
              >
                Avbryt
              </button>
            </div>
          ) : (
            <div className="flex gap-6 mb-3">
              <div>
                <div className="text-xs text-text-muted">Min rating</div>
                <div className="text-lg font-medium">{movie.my_rating ?? '–'}</div>
              </div>
              <div>
                <div className="text-xs text-text-muted">IMDb</div>
                <div className="text-lg font-medium">{movie.imdb_rating ?? '–'}</div>
              </div>
              <div>
                <div className="text-xs text-text-muted">Placering</div>
                <div className="text-lg font-medium">{movie.location?.name ?? '–'}</div>
              </div>
            </div>
          )}

          {tmdb?.overview && (
            <p className="text-sm text-text-muted max-w-lg leading-relaxed">{tmdb.overview}</p>
          )}
        </div>
      </div>

      {(director || cast.length > 0) && (
        <div className="mt-5 pt-4 border-t border-border">
          <div className="text-xs text-text-muted mb-2">Skådespelare & regissör</div>
          <div className="flex flex-wrap gap-2">
            {director && (
              <span className="rounded-full border border-border px-3 py-1 text-xs">
                Regissör: {director.name}
              </span>
            )}
            {cast.map((c) => (
              <span key={c.name} className="rounded-full border border-border px-3 py-1 text-xs">
                {c.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {!editing && (
        <div className="mt-5 flex gap-2">
          <button
            onClick={startEdit}
            className="rounded-md border border-border px-3 py-2 min-h-11 text-sm hover:bg-surface-2"
          >
            Redigera
          </button>
          <button
            onClick={handleDelete}
            className="rounded-md border border-border px-3 py-2 min-h-11 text-sm text-danger hover:bg-surface-2"
          >
            Ta bort
          </button>
        </div>
      )}

      {showMatchModal && (
        <MatchMovieModal
          movie={movie}
          onClose={() => setShowMatchModal(false)}
          onMatched={(updated) => setMovie(updated)}
        />
      )}
    </div>
  )
}
