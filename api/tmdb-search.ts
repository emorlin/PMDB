import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireProxySecret } from './_lib/auth.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!requireProxySecret(req, res)) return

  const query = typeof req.query.query === 'string' ? req.query.query : ''
  if (!query.trim()) {
    res.status(200).json({ results: [] })
    return
  }

  const url = new URL('https://api.themoviedb.org/3/search/movie')
  url.searchParams.set('api_key', process.env.TMDB_API_KEY ?? '')
  url.searchParams.set('language', 'sv-SE')
  url.searchParams.set('include_adult', 'false')
  url.searchParams.set('query', query)

  const tmdbRes = await fetch(url.toString())
  const data = await tmdbRes.json()
  res.status(tmdbRes.status).json(data)
}
