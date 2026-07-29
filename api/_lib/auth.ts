import type { VercelRequest, VercelResponse } from '@vercel/node'

// Enkelt delat-hemlighet-skydd. Stoppar slumpmässiga bottar/scanners som
// hittar URL:en, men är INTE en ersättning för riktig inloggning eftersom
// hemligheten skickas från klienten och därmed finns i den publika JS-bundeln.
export function requireProxySecret(req: VercelRequest, res: VercelResponse): boolean {
  const expected = process.env.PROXY_SECRET
  if (!expected) {
    // Inget hemlighet konfigurerad server-side -> proxyn är avsiktligt öppen.
    return true
  }
  const provided = req.headers['x-proxy-secret']
  if (provided !== expected) {
    res.status(401).json({ error: 'Unauthorized' })
    return false
  }
  return true
}
