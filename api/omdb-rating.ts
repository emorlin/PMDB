import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireProxySecret } from './_lib/auth.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!requireProxySecret(req, res)) return

  const imdbId = typeof req.query.imdbId === 'string' ? req.query.imdbId : ''
  if (!imdbId) {
    res.status(400).json({ error: 'Missing imdbId' })
    return
  }

  const url = new URL('https://www.omdbapi.com/')
  url.searchParams.set('apikey', process.env.OMDB_API_KEY ?? '')
  url.searchParams.set('i', imdbId)

  const omdbRes = await fetch(url.toString())
  const data = await omdbRes.json()
  res.status(omdbRes.status).json(data)
}
