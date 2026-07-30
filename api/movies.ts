import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireClerkAuth } from './_lib/clerkAuth.js'
import { supabase } from './_lib/supabase.js'

const SELECT_WITH_LOCATION = '*, location:locations(name)'

function parseBody(req: VercelRequest): Record<string, unknown> {
  const raw = req.body ?? {}
  if (typeof raw !== 'string') return raw
  try {
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const userId = await requireClerkAuth(req, res)
  if (!userId) return

  if (req.method === 'POST') {
    const { data, error } = await supabase
      .from('movies')
      .insert(parseBody(req))
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
      .update(parseBody(req))
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
