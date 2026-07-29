# PMDB – min filmsamling

React 19 + TypeScript + Tailwind (Vite) + Supabase, deployad på Vercel. Filmdata (poster, handling, skådespelare, genre) hämtas alltid live från TMDB. IMDb-betyget hämtas via OMDb när en film läggs till.

TMDB- och OMDb-nycklarna ligger **aldrig** i webbläsaren. Alla anrop till dem går via egna serverless-funktioner (`/api/tmdb-search.ts`, `/api/tmdb-movie.ts`, `/api/omdb-rating.ts`) som håller nycklarna server-side.

## 1. Skapa Supabase-projekt

1. Gå till [supabase.com](https://supabase.com) och skapa ett gratis konto/projekt.
2. Öppna **SQL Editor** i projektet och kör filerna i `supabase/migrations/` i nummerordning (`0001_init.sql`, sedan `0002_locations.sql`). De skapar `movies`- och `locations`-tabellerna.
3. Gå till **Project Settings → API** och kopiera:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon public` key → `VITE_SUPABASE_ANON_KEY`

Supabase anon-nyckel är avsedd att vara publik (Supabases säkerhetsmodell bygger på Row Level Security, inte på att nyckeln är hemlig), så den behöver inte döljas som TMDB/OMDb-nycklarna.

## 2. Skaffa TMDB API-nyckel

1. Skapa konto på [themoviedb.org](https://www.themoviedb.org).
2. Gå till kontoinställningar → **API** → begär en nyckel (välj "Developer").
3. Kopiera **API Key (v3 auth)** → `TMDB_API_KEY` (utan `VITE_`-prefix).

## 3. Skaffa OMDb API-nyckel (för riktigt IMDb-betyg)

1. Gå till [omdbapi.com/apikey.aspx](https://www.omdbapi.com/apikey.aspx) och välj gratisnivån (1000 anrop/dag).
2. Aktivera nyckeln via länken som skickas till din mejl.
3. Klistra in nyckeln → `OMDB_API_KEY` (utan `VITE_`-prefix).

## 4. Konfigurera miljövariabler

```bash
cp .env.example .env
```

Fyll i värdena från stegen ovan. Sätt även `PROXY_SECRET` och `VITE_PROXY_SECRET` till **samma** valfria hemliga text (t.ex. en lång slumpad sträng) – det är ett enkelt skydd mot att andra hittar din publika URL och förbrukar din TMDB/OMDb-kvot. Det är inte en riktig inloggning, bara ett filter mot slumpmässigt missbruk.

### I produktion (Vercel)

`.env` committas inte (den är gitignorad) och läses bara lokalt. När du deployar till Vercel, lägg in samma variabler under **Project Settings → Environment Variables** i Vercel-dashboarden.

## 5. Kör appen lokalt

Lokal utveckling körs med Vercel CLI så att `/api`-funktionerna fungerar precis som i produktion:

```bash
npm install
npm run dev
```

`npm run dev` kör `npx vercel dev`. Första gången ber CLI:t dig logga in och länka projektet till ett Vercel-konto (gratis) – det är bara ett engångssteg.

Vill du bara jobba med gränssnittet utan `/api`-anropen kan du köra `npm run dev:vite-only`, men då fungerar inte sök/lägg till film eftersom de går via proxyn.

## Att tänka på

- `user_id`-kolumnen i `movies` och `locations` är förberedd för flera användare men används inte ännu – appen har ingen inloggning i det här steget. `PROXY_SECRET`-skyddet är ett provisorium tills dess.
- Poster, handling, skådespelare och genre cachas inte i databasen utan hämtas från TMDB varje gång de visas, enligt tidigare beslut.
- Lägg till minst en plats under **Inställningar** innan du lägger till din första film, annars är platslistan tom i "Lägg till film"-modalen.
- En plats kan inte tas bort medan den används av en film i samlingen (databasen blockerar det via en foreign key).
