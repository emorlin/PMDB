import type { VercelRequest, VercelResponse } from '@vercel/node'
import { verifyToken } from '@clerk/backend'

// Kräver en giltig Clerk-session (inloggning). Till skillnad från
// requireProxySecret (auth.ts) verifierar detta faktiskt VEM som anropar,
// via samma Clerk-app som används i bokklubben-projektet.
export async function requireClerkAuth(req: VercelRequest, res: VercelResponse): Promise<string | null> {
  const authHeader = req.headers['authorization']
  const token = typeof authHeader === 'string' && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null

  const secretKey = process.env.CLERK_SECRET_KEY
  if (!token || !secretKey) {
    res.status(401).json({ error: 'Unauthorized' })
    return null
  }

  try {
    const payload = await verifyToken(token, { secretKey })
    return payload.sub
  } catch {
    res.status(401).json({ error: 'Unauthorized' })
    return null
  }
}
