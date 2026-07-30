import { createClient } from '@supabase/supabase-js'

// Server-side klient för de skyddade /api/movies och /api/locations-rutterna.
// Samma projekt/schema som src/lib/supabase.ts, men körs bara efter att
// requireClerkAuth har verifierat att anroparen är inloggad.
export const supabase = createClient(
  process.env.VITE_SUPABASE_URL ?? '',
  process.env.VITE_SUPABASE_ANON_KEY ?? '',
  { db: { schema: 'pmdb' } },
)
