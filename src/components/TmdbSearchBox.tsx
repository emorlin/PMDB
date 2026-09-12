import type { RefObject } from 'react'
import { posterUrl, type TmdbSearchResult } from '../lib/tmdb'

interface Props {
  idPrefix: string
  query: string
  onQueryChange: (value: string) => void
  year: string
  onYearChange: (value: string) => void
  results: TmdbSearchResult[]
  loading: boolean
  onPick: (result: TmdbSearchResult) => void
  searchInputRef?: RefObject<HTMLInputElement | null>
}

export default function TmdbSearchBox({
  idPrefix,
  query,
  onQueryChange,
  year,
  onYearChange,
  results,
  loading,
  onPick,
  searchInputRef,
}: Props) {
  return (
    <>
      <div className="flex gap-2">
        <div className="flex-1">
          <label htmlFor={`${idPrefix}-search`} className="sr-only">
            Sök filmtitel
          </label>
          <input
            ref={searchInputRef}
            id={`${idPrefix}-search`}
            type="text"
            placeholder="Sök filmtitel..."
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            className="w-full rounded-md bg-surface-2 border border-border px-3 py-2 text-base focus:border-accent"
          />
        </div>
        <div className="w-20">
          <label htmlFor={`${idPrefix}-search-year`} className="sr-only">
            Årtal (för att smalna ner sökningen)
          </label>
          <input
            id={`${idPrefix}-search-year`}
            type="text"
            inputMode="numeric"
            placeholder="År"
            maxLength={4}
            value={year}
            onChange={(e) => onYearChange(e.target.value.replace(/\D/g, ''))}
            className="w-full rounded-md bg-surface-2 border border-border px-2 py-2 text-base focus:border-accent"
          />
        </div>
      </div>
      <div aria-live="polite">
        {(loading || results.length > 0) && (
          <ul className="mt-1 border border-border rounded-md overflow-hidden max-h-64 overflow-y-auto">
            {loading && (
              <li role="status" className="px-3 py-2 text-xs text-text-muted">
                Söker...
              </li>
            )}
            {results.map((r) => (
              <li key={r.id} className="border-b border-border last:border-b-0">
                <button
                  onClick={() => onPick(r)}
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
  )
}
