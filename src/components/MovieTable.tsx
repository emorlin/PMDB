import { Link, useNavigate } from 'react-router-dom'
import type { Movie, SortColumn, SortDirection } from '../types/movie'

interface Props {
  movies: Movie[]
  sort: SortColumn
  dir: SortDirection
  onSort: (col: SortColumn) => void
}

const columns: { key: SortColumn; label: string }[] = [
  { key: 'title', label: 'Titel' },
  { key: 'year', label: 'År' },
  { key: 'my_rating', label: 'Rating' },
  { key: 'imdb_rating', label: 'IMDb' },
  { key: 'runtime_minutes', label: 'Tid' },
  { key: 'location', label: 'Placering' },
]

function formatRuntime(min: number | null) {
  if (!min) return '–'
  const h = Math.floor(min / 60)
  const m = min % 60
  return `${h}h ${m.toString().padStart(2, '0')}min`
}

function ariaSortFor(col: SortColumn, sort: SortColumn, dir: SortDirection): 'ascending' | 'descending' | 'none' {
  if (col !== sort) return 'none'
  return dir === 'asc' ? 'ascending' : 'descending'
}

export default function MovieTable({ movies, sort, dir, onSort }: Props) {
  const navigate = useNavigate()

  return (
    <div>
      {/* Desktop/tablet: sorterbar tabell */}
      <div className="hidden md:block border border-border rounded-lg overflow-hidden overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <caption className="sr-only">Filmsamling, sorterbar tabell</caption>
          <thead>
            <tr className="bg-surface-2">
              {columns.map((c) => (
                <th
                  key={c.key}
                  scope="col"
                  aria-sort={ariaSortFor(c.key, sort, dir)}
                  className="border-b border-border p-0"
                >
                  <button
                    type="button"
                    onClick={() => onSort(c.key)}
                    className="w-full flex items-center gap-1 text-left font-medium text-text-muted px-3 py-2 hover:text-text"
                  >
                    {c.label}
                    <span aria-hidden="true">{sort === c.key ? (dir === 'asc' ? '▲' : '▼') : ''}</span>
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {movies.map((m) => (
              <tr
                key={m.id}
                onClick={() => navigate(`/movie/${m.id}`)}
                className="cursor-pointer hover:bg-surface-2 border-b border-border last:border-b-0"
              >
                <td className="px-3 py-2">
                  <Link
                    to={`/movie/${m.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="hover:underline"
                  >
                    {m.title}
                  </Link>
                </td>
                <td className="px-3 py-2">{m.year ?? '–'}</td>
                <td className="px-3 py-2">{m.my_rating ?? '–'}</td>
                <td className="px-3 py-2">{m.imdb_rating ?? '–'}</td>
                <td className="px-3 py-2">{formatRuntime(m.runtime_minutes)}</td>
                <td className="px-3 py-2">{m.location?.name ?? '–'}</td>
              </tr>
            ))}
            {movies.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-3 py-8 text-center text-text-muted">
                  Inga filmer ännu. Lägg till din första film.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobil: sortval + kortlista */}
      <div className="md:hidden">
        <div className="flex items-center gap-2 mb-3">
          <label htmlFor="mobile-sort-column" className="sr-only">
            Sortera efter
          </label>
          <select
            id="mobile-sort-column"
            value={sort}
            onChange={(e) => onSort(e.target.value as SortColumn)}
            className="flex-1 rounded-md bg-surface-2 border border-border px-2 py-2 text-sm"
          >
            {columns.map((c) => (
              <option key={c.key} value={c.key}>
                Sortera: {c.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => onSort(sort)}
            className="rounded-md border border-border px-3 py-2 text-sm min-h-11"
            aria-label={dir === 'asc' ? 'Sorterar stigande, byt till fallande' : 'Sorterar fallande, byt till stigande'}
          >
            <span aria-hidden="true">{dir === 'asc' ? '▲' : '▼'}</span>
          </button>
        </div>

        {movies.length === 0 ? (
          <div className="text-center text-text-muted text-sm py-8">
            Inga filmer ännu. Lägg till din första film.
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {movies.map((m) => (
              <li key={m.id} className="border border-border rounded-lg">
                <Link
                  to={`/movie/${m.id}`}
                  className="flex flex-col gap-1 px-4 py-3 min-h-11 hover:bg-surface-2 rounded-lg"
                >
                  <span className="font-medium">{m.title}</span>
                  <span className="text-xs text-text-muted">
                    {m.year ?? '–'} · {formatRuntime(m.runtime_minutes)} · {m.location?.name ?? '–'}
                  </span>
                  <span className="text-xs text-text-muted">
                    Rating: {m.my_rating ?? '–'} · IMDb: {m.imdb_rating ?? '–'}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
