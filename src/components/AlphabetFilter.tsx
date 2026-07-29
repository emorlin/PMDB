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
        className={`hidden md:flex flex-col gap-0.5 flex-shrink-0 ${disabled ? 'opacity-40 pointer-events-none' : ''}`}
      >
        <button
          onClick={() => onSelect(null)}
          className={`text-xs px-1.5 py-0.5 rounded text-left ${
            active === null ? 'text-accent font-medium' : 'text-text-muted hover:text-text'
          }`}
        >
          Alla
        </button>
        {LETTERS.map((l) => (
          <button
            key={l}
            onClick={() => onSelect(l)}
            className={`text-xs px-1.5 py-0.5 rounded text-left ${
              active === l ? 'text-accent font-medium' : 'text-text-muted hover:text-text'
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Mobil: dropdown */}
      <select
        disabled={disabled}
        value={active ?? ''}
        onChange={(e) => onSelect(e.target.value || null)}
        className="md:hidden mb-3 w-full rounded-md bg-surface-2 border border-border px-2 py-1.5 text-sm disabled:opacity-40"
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
