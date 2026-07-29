// Hemligheten här är avsiktligt "svag" (den ligger i den publika JS-bundeln).
// Den stoppar inte en motiverad angripare, bara slumpmässiga bottar/scanners
// som hittar den publika Vercel-URL:en. Riktigt skydd kräver inloggning.
const PROXY_SECRET = import.meta.env.VITE_PROXY_SECRET

export function proxyHeaders(): HeadersInit {
  return PROXY_SECRET ? { 'x-proxy-secret': PROXY_SECRET } : {}
}
