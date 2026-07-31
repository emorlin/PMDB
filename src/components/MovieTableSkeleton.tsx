const SKELETON_ROWS = 10
const MOBILE_SKELETON_CARDS = 6
const COLUMN_LABELS = ['Titel', 'År', 'Rating', 'IMDb', 'Tid', 'Placering']
const COLUMN_WIDTHS = ['w-3/4', 'w-10', 'w-8', 'w-10', 'w-14', 'w-16']

// Rent visuell platshållare medan filmlistan laddas – matchar MovieTables
// form (tabell/kortlista) så layouten inte hoppar när riktig data dyker upp.
// aria-hidden eftersom det inte finns någon riktig data att läsa upp; en
// separat sr-only role="status"-text i anropande sida sköter det istället.
export default function MovieTableSkeleton() {
  return (
    <div aria-hidden="true">
      <div className="hidden md:block border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-surface-2">
              {COLUMN_LABELS.map((label) => (
                <th
                  key={label}
                  className="text-left font-medium text-text-muted px-3 py-2 border-b border-border"
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
              <tr key={i} className="border-b border-border last:border-b-0">
                {COLUMN_WIDTHS.map((w, j) => (
                  <td key={j} className="px-3 py-2">
                    <div className={`h-4 ${w} rounded bg-surface-2 animate-pulse`} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="md:hidden flex flex-col gap-2">
        {Array.from({ length: MOBILE_SKELETON_CARDS }).map((_, i) => (
          <li key={i} className="border border-border rounded-lg px-4 py-3">
            <div className="h-4 w-2/3 rounded bg-surface-2 animate-pulse mb-2" />
            <div className="h-3 w-1/2 rounded bg-surface-2 animate-pulse" />
          </li>
        ))}
      </ul>
    </div>
  )
}
