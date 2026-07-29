import { proxyHeaders } from './proxy'

// Går via /api/omdb-rating.ts så att OMDb-nyckeln aldrig finns i webbläsaren.
// Anropas bara när en film läggs till, så gratis-kvoten (1000/dag) räcker gott.
export async function getImdbRating(imdbId: string): Promise<number | null> {
  const url = `/api/omdb-rating?imdbId=${encodeURIComponent(imdbId)}`
  const res = await fetch(url, { headers: proxyHeaders() })
  if (!res.ok) return null
  const data = await res.json()
  const rating = parseFloat(data.imdbRating)
  return Number.isFinite(rating) ? rating : null
}
