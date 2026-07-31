import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireClerkAuth } from './_lib/clerkAuth.js'
import { supabase } from './_lib/supabase.js'
import { parseBody } from './_lib/parseBody.js'

const SELECT_WITH_LOCATION = '*, location:locations(name)'

// Endast dessa fält får sättas via insert – hindrar klienten från att skicka
// med t.ex. id/user_id/created_at och därmed styra kolumner den inte ska nå.
function pickInsertFields(body: Record<string, unknown>) {
  const { tmdb_id, imdb_id, title, year, runtime_minutes, my_rating, imdb_rating, location_id } = body
  return { tmdb_id, imdb_id, title, year, runtime_minutes, my_rating, imdb_rating, location_id }
}

// Smalare whitelist för uppdatering – matchar de fält appen faktiskt
// redigerar (titel/rating/plats vid "Redigera", tmdb/imdb-fält vid TMDB-matchning).
function pickUpdateFields(body: Record<string, unknown>) {
  const { title, tmdb_id, imdb_id, imdb_rating, my_rating, location_id } = body
  return { title, tmdb_id, imdb_id, imdb_rating, my_rating, location_id }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const userId = await requireClerkAuth(req, res)
  if (!userId) return

  if (req.method === 'POST') {
    const { data, error } = await supabase
      .from('movies')
      .insert(pickInsertFields(parseBody(req)))
      .select(SELECT_WITH_LOCATION)
      .single()
    if (error) return res.status(400).json({ error: error.message })
    return res.status(200).json(data)
  }

  if (req.method === 'PATCH') {
    const id = typeof req.query.id === 'string' ? req.query.id : ''
    if (!id) return res.status(400).json({ error: 'Missing id' })
    const { data, error } = await supabase
      .from('movies')
      .update(pickUpdateFields(parseBody(req)))
      .eq('id', id)
      .select(SELECT_WITH_LOCATION)
      .single()
    if (error) return res.status(400).json({ error: error.message })
    return res.status(200).json(data)
  }

  if (req.method === 'DELETE') {
    const id = typeof req.query.id === 'string' ? req.query.id : ''
    if (!id) return res.status(400).json({ error: 'Missing id' })
    const { error } = await supabase.from('movies').delete().eq('id', id)
    if (error) return res.status(400).json({ error: error.message })
    return res.status(204).end()
  }

  res.status(405).json({ error: 'Method Not Allowed' })
}
