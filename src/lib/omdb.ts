const OMDB_BASE = 'https://www.omdbapi.com/'
const apiKey = import.meta.env.VITE_OMDB_API_KEY

// OMDb ger det riktiga IMDb-betyget (TMDB har bara sitt eget vote_average).
// Anropas bara när en film läggs till, så gratis-kvoten (1000/dag) räcker gott.
export async function getImdbRating(imdbId: string): Promise<number | null> {
  if (!apiKey) {
    console.warn('VITE_OMDB_API_KEY saknas, kan inte hämta IMDb-betyg.')
    return null
  }
  const url = new URL(OMDB_BASE)
  url.searchParams.set('apikey', apiKey)
  url.searchParams.set('i', imdbId)

  const res = await fetch(url.toString())
  if (!res.ok) return null
  const data = await res.json()
  const rating = parseFloat(data.imdbRating)
  return Number.isFinite(rating) ? rating : null
}
