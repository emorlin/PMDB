const LETTERS = '#ABCDEFGHIJKLMNOPQRSTUVWXYZÅÄÖ'.split('')

interface Props {
  active: string | null
  onSelect: (letter: string | null) => void
  disabled: boolean
}

export default function AlphabetFilter({ active, onSelect, disabled }: Props) {
  return (
    <>
      {/* Desktop: horisontell bokstavsrad */}
      <div
        role="group"
        aria-label="Filtrera efter bokstav"
        className={`hidden md:flex flex-wrap items-center gap-1 mb-4 pb-4 border-b border-border ${disabled ? 'opacity-40 pointer-events-none' : ''}`}
      >
        <button
          type="button"
          aria-pressed={active === null}
          onClick={() => onSelect(null)}
          className={`px-2 h-7 rounded text-xs font-medium ${
            active === null ? 'bg-surface-2 text-accent-text' : 'text-text-muted hover:text-text'
          }`}
        >
          Alla
        </button>
        <span className="w-px h-5 bg-border mx-1" aria-hidden="true" />
        {LETTERS.map((l) => (
          <button
            key={l}
            type="button"
            aria-pressed={active === l}
            onClick={() => onSelect(l)}
            className={`w-7 h-7 rounded text-xs ${
              active === l ? 'bg-surface-2 text-accent-text font-medium' : 'text-text-muted hover:text-text'
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Mobil: dropdown */}
      <label htmlFor="alphabet-filter-mobile" className="sr-only md:hidden">
        Filtrera efter bokstav
      </label>
      <select
        id="alphabet-filter-mobile"
        disabled={disabled}
        value={active ?? ''}
        onChange={(e) => onSelect(e.target.value || null)}
        className="md:hidden mb-3 w-full rounded-md bg-surface-2 border border-border px-2 py-2 text-sm disabled:opacity-40"
      >
        <option value="">Alla bokstäver</option>
        {LETTERS.map((l) => (
          <option key={l} value={l}>
            {l}
          </option>
        ))}
      </select>
    </>
  )
}
