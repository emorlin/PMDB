const LETTERS = '#ABCDEFGHIJKLMNOPQRSTUVWXYZÅÄÖ'.split('')

interface Props {
  active: string | null
  onSelect: (letter: string | null) => void
  disabled: boolean
}

export default function AlphabetFilter({ active, onSelect, disabled }: Props) {
  return (
    <>
      {/* Desktop: vertikal bokstavslista */}
      <div
        role="group"
        aria-label="Filtrera efter bokstav"
        className={`hidden md:flex flex-col gap-0.5 shrink-0 ${disabled ? 'opacity-40 pointer-events-none' : ''}`}
      >
        <button
          type="button"
          aria-pressed={active === null}
          onClick={() => onSelect(null)}
          className={`text-xs px-2 py-1 rounded text-left ${
            active === null ? 'text-accent-text font-medium' : 'text-text-muted hover:text-text'
          }`}
        >
          Alla
        </button>
        {LETTERS.map((l) => (
          <button
            key={l}
            type="button"
            aria-pressed={active === l}
            onClick={() => onSelect(l)}
            className={`text-xs px-2 py-1 rounded text-left ${
              active === l ? 'text-accent-text font-medium' : 'text-text-muted hover:text-text'
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
