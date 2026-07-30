import type { VercelRequest } from '@vercel/node'

// Vercel parsar normalt JSON-body automatiskt, men under `vercel dev` har den
// ibland kommit in som en rå sträng – tolka defensivt i båda fallen.
export function parseBody(req: VercelRequest): Record<string, unknown> {
  const raw = req.body ?? {}
  if (typeof raw !== 'string') return raw
  try {
    return JSON.parse(raw)
  } catch {
    return {}
  }
}
