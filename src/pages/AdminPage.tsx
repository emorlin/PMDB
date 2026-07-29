import { useEffect, useState } from 'react'
import { useTheme } from '../lib/theme-context'
import { listLocations, addLocation, deleteLocation } from '../lib/locations'
import type { Location } from '../types/location'

export default function AdminPage() {
  const { theme, setTheme } = useTheme()
  const [locations, setLocations] = useState<Location[]>([])
  const [newName, setNewName] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      setLocations(await listLocations())
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function handleAdd() {
    if (!newName.trim()) return
    setSaving(true)
    setError(null)
    try {
      const loc = await addLocation(newName.trim())
      setLocations((prev) => [...prev, loc].sort((a, b) => a.name.localeCompare(b.name, 'sv')))
      setNewName('')
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    setError(null)
    try {
      await deleteLocation(id)
      setLocations((prev) => prev.filter((l) => l.id !== id))
    } catch (e) {
      setError((e as Error).message)
    }
  }

  return (
    <div className="max-w-md">
      <h1 className="text-lg font-medium mb-6">Inställningar</h1>

      <section className="mb-8">
        <h2 className="text-sm font-medium text-text-muted mb-2">Tema</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setTheme('light')}
            className={`rounded-md border px-3 py-1.5 text-sm ${
              theme === 'light' ? 'border-accent text-accent' : 'border-border'
            }`}
          >
            Ljust
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={`rounded-md border px-3 py-1.5 text-sm ${
              theme === 'dark' ? 'border-accent text-accent' : 'border-border'
            }`}
          >
            Mörkt
          </button>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-medium text-text-muted mb-2">Platser (placering)</h2>

        {error && <div className="text-xs text-red-400 mb-2">{error}</div>}

        {loading ? (
          <div className="text-text-muted text-sm mb-3">Laddar...</div>
        ) : (
          <ul className="border border-border rounded-md overflow-hidden mb-3">
            {locations.map((l) => (
              <li
                key={l.id}
                className="flex items-center justify-between px-3 py-2 text-sm border-b border-border last:border-b-0"
              >
                {l.name}
                <button
                  onClick={() => handleDelete(l.id)}
                  className="text-text-muted hover:text-red-400 text-xs"
                >
                  Ta bort
                </button>
              </li>
            ))}
            {locations.length === 0 && (
              <li className="px-3 py-3 text-sm text-text-muted">Inga platser ännu.</li>
            )}
          </ul>
        )}

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Ny plats (t.ex. Hylla 4)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            className="flex-1 rounded-md bg-surface-2 border border-border px-2 py-1.5 text-sm outline-none focus:border-accent"
          />
          <button
            onClick={handleAdd}
            disabled={saving}
            className="rounded-md bg-accent text-black px-3 py-1.5 text-sm font-medium disabled:opacity-50"
          >
            Lägg till
          </button>
        </div>
      </section>
    </div>
  )
}
