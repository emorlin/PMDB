import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireProxySecret } from './_lib/auth.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!requireProxySecret(req, res)) return

  const id = typeof req.query.id === 'string' ? req.query.id : ''
  if (!id) {
    res.status(400).json({ error: 'Missing id' })
    return
  }

  const url = new URL(`https://api.themoviedb.org/3/movie/${encodeURIComponent(id)}`)
  url.searchParams.set('api_key', process.env.TMDB_API_KEY ?? '')
  url.searchParams.set('language', 'sv-SE')
  url.searchParams.set('append_to_response', 'credits,external_ids')

  const tmdbRes = await fetch(url.toString())
  const data = await tmdbRes.json()
  res.status(tmdbRes.status).json(data)
}
