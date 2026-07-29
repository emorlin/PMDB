import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase env vars saknas. Kopiera .env.example till .env och fyll i VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY.',
  )
}

// Egna schema "pmdb" istället för public, eftersom databasen delas med
// andra projekt. Måste även läggas till under Project Settings -> API ->
// Data API Settings -> Exposed schemas i Supabase-dashboarden (se README).
export const supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '', {
  db: { schema: 'pmdb' },
})
