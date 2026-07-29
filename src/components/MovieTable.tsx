import { useNavigate } from 'react-router-dom'
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

export default function MovieTable({ movies, sort, dir, onSort }: Props) {
  const navigate = useNavigate()

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-surface-2">
            {columns.map((c) => (
              <th
                key={c.key}
                onClick={() => onSort(c.key)}
                className="text-left font-medium text-text-muted px-3 py-2 border-b border-border cursor-pointer select-none hover:text-text"
              >
                {c.label} {sort === c.key ? (dir === 'asc' ? '▲' : '▼') : ''}
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
              <td className="px-3 py-2">{m.title}</td>
              <td className="px-3 py-2">{m.year ?? '–'}</td>
              <td className="px-3 py-2">{m.my_rating ?? '–'}</td>
              <td className="px-3 py-2">{m.imdb_rating ?? '–'}</td>
              <td className="px-3 py-2">{formatRuntime(m.runtime_minutes)}</td>
              <td className="px-3 py-2">{m.location ?? '–'}</td>
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
  )
}
