import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireClerkAuth } from './_lib/clerkAuth.js'
import { supabase } from './_lib/supabase.js'
import { parseBody } from './_lib/parseBody.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const userId = await requireClerkAuth(req, res)
  if (!userId) return

  if (req.method === 'POST') {
    const { name } = parseBody(req)
    const { data, error } = await supabase.from('locations').insert({ name }).select().single()
    if (error) return res.status(400).json({ error: error.message })
    return res.status(200).json(data)
  }

  if (req.method === 'DELETE') {
    const id = typeof req.query.id === 'string' ? req.query.id : ''
    if (!id) return res.status(400).json({ error: 'Missing id' })
    const { error } = await supabase.from('locations').delete().eq('id', id)
    if (error) {
      if (error.code === '23503') {
        return res
          .status(409)
          .json({ error: 'Kan inte ta bort platsen – den används av minst en film i samlingen.' })
      }
      return res.status(400).json({ error: error.message })
    }
    return res.status(204).end()
  }

  res.status(405).json({ error: 'Method Not Allowed' })
}
