# PMDB – min filmsamling

React 19 + TypeScript + Tailwind (Vite) + Supabase, deployad på Vercel. Filmdata (poster, handling, skådespelare, genre) hämtas alltid live från TMDB. IMDb-betyget hämtas via OMDb när en film läggs till.

TMDB- och OMDb-nycklarna ligger **aldrig** i webbläsaren. Alla anrop till dem går via egna serverless-funktioner (`/api/tmdb-search.ts`, `/api/tmdb-movie.ts`, `/api/omdb-rating.ts`) som håller nycklarna server-side.

## 1. Supabase: eget schema i ett befintligt projekt

Filmsamlingen delar Supabase-projekt med annat (t.ex. om ditt abonnemang bara tillåter ett fåtal projekt). Alla tabeller ligger därför i ett eget schema, `pmdb`, helt åtskilt från vad som redan finns i databasen.

1. Öppna ditt befintliga Supabase-projekt.
2. Öppna **SQL Editor** och kör filerna i `supabase/migrations/` i nummerordning (`0001_init.sql`, `0002_locations.sql`, `0003_optional_tmdb.sql`). De skapar schemat `pmdb` samt tabellerna `pmdb.movies` och `pmdb.locations`, med egna GRANTs så att appen kommer åt dem.
3. (Valfritt, för att testa UX/UI direkt) Kör även `supabase/seed.sql` i samma SQL Editor. Den lägger in 5 platser och 16 kända filmer med riktiga TMDB/IMDb-id:n, så poster/handling/skådespelare visas på riktigt. Säker att köra flera gånger – dubbletter skapas inte.
4. **Viktigt:** gå till **Project Settings → API → Data API Settings → Exposed schemas** och lägg till `pmdb` i listan (den innehåller bara `public` som standard). Utan det här steget svarar Supabase med ett schema-fel när appen försöker läsa/skriva.
5. Hämta Project URL och en publik nyckel. Enklast via **Connect**-knappen högst upp på projektsidan, som visar båda direkt. Annars i **Settings → API Keys**:
   - **Project URL** (formatet `https://ditt-projekt-id.supabase.co`) → `VITE_SUPABASE_URL`
   - **Publishable key** (`sb_publishable_...`) → `VITE_SUPABASE_ANON_KEY`. Detta är den nya ersättaren för den gamla "anon public"-nyckeln – finns inte redan en publishable key, klicka **Create new API Keys** och kopiera den. Den gamla `anon`-nyckeln (JWT) ligger kvar under fliken **Legacy API Keys** om du hellre vill använda den, men Supabase fasar ut den till slutet av 2026.

Namnet på env-variabeln (`VITE_SUPABASE_ANON_KEY`) spelar ingen roll för koden – den fungerar oavsett om värdet är en ny publishable key eller den gamla anon-JWT:en.

**Använd aldrig Secret key** (`sb_secret_...`, eller den gamla `service_role`-nyckeln). Connect-dialogen visar ofta båda i samma kodsnutt (`SUPABASE_PUBLISHABLE_KEY` och `SUPABASE_SECRET_KEY`) – bara den förstnämnda ska in i `.env`. Secret key har full åtkomst och kringgår RLS helt; den ska aldrig hamna i klientkod eller i den här appen över huvud taget. Har du redan klistrat in en secret key någonstans (t.ex. i en chatt), rotera den i Supabase (Settings → API Keys) som en säkerhetsåtgärd.

Nyckeln (oavsett typ) är avsedd att vara publik (Supabases säkerhetsmodell bygger på Row Level Security, inte på att nyckeln är hemlig), så den behöver inte döljas som TMDB/OMDb-nycklarna. Eftersom projektet delas med annat: samma nyckel kan i teorin användas för att fråga vilken annan tabell som helst som också är exponerad i det projektet – det påverkar inte det andra projektet eftersom det styrs av dess egna RLS-policyer, men värt att känna till.

## 2. Skaffa TMDB API-nyckel

1. Skapa konto på [themoviedb.org](https://www.themoviedb.org).
2. Gå till kontoinställningar → **API** → begär en nyckel (välj "Developer").
3. Kopiera **API Key (v3 auth)** → `TMDB_API_KEY` (utan `VITE_`-prefix).

## 3. Skaffa OMDb API-nyckel (för riktigt IMDb-betyg)

1. Gå till [omdbapi.com/apikey.aspx](https://www.omdbapi.com/apikey.aspx) och välj gratisnivån (1000 anrop/dag).
2. Aktivera nyckeln via länken som skickas till din mejl.
3. Klistra in nyckeln → `OMDB_API_KEY` (utan `VITE_`-prefix).

## 4. Konfigurera miljövariabler

Om filen `.env` inte redan finns i projektmappen, skapa den utifrån mallen:

```bash
cp .env.example .env
```

(Finns `.env` redan – t.ex. för att du eller Claude redan fyllt i värden – kör inte kommandot igen, det skriver över filen med tomma fält.)

Fyll i värdena från stegen ovan. Sätt även `PROXY_SECRET` och `VITE_PROXY_SECRET` till **samma** valfria hemliga text – det är ett enkelt skydd mot att andra hittar din publika URL och förbrukar din TMDB/OMDb-kvot, inte en riktig inloggning. Generera en slumpad sträng till den t.ex. så här:

```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

Klistra in samma resultat i både `PROXY_SECRET` och `VITE_PROXY_SECRET`.

### I produktion (Vercel)

`.env` committas inte (den är gitignorad) och läses bara lokalt. När du deployar till Vercel, lägg in samma variabler under **Project Settings → Environment Variables** i Vercel-dashboarden.

## 5. Kör appen lokalt

Lokal utveckling körs med Vercel CLI så att `/api`-funktionerna fungerar precis som i produktion:

```bash
npm install
npx vercel dev
```

Kör `npx vercel dev` direkt i terminalen – **inte** via `npm run dev` (det skulle få Vercel att försöka starta sig självt och krascha med ett "recursive invocation"-fel, eftersom `npm run dev` annars ligger i vägen för hur Vercel läser av utvecklingskommandot). `npm run dev` startar istället bara Vite rakt av, utan `/api`-funktionerna.

Första gången `vercel dev` körs ber CLI:t dig logga in och länka projektet till ett Vercel-konto (gratis) – det är bara ett engångssteg.

Vill du bara jobba med gränssnittet utan `/api`-anropen räcker `npm run dev`, men då fungerar inte sök/lägg till film eftersom de går via proxyn.

## 6. Deploya till Vercel

Projektet är redan länkat till ett Vercel-projekt (skapades automatiskt förra gången `vercel dev` kördes – ligger sparat i `.vercel/`, som inte committas).

1. Gå till [vercel.com](https://vercel.com) → ditt projekt (`pmdb`) → **Settings → Environment Variables**.
2. Lägg till samma sex variabler som i din lokala `.env`, en i taget: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_PROXY_SECRET`, `TMDB_API_KEY`, `OMDB_API_KEY`, `PROXY_SECRET`. Välj **Production** (kryssa gärna även i Preview om du vill att förhandsgranskningar ska fungera).
3. Kör i projektmappen:
   ```bash
   npx vercel --prod
   ```
   Detta bygger och publicerar appen. Efter en stund får du en URL (t.ex. `pmdb.vercel.app`) i terminalen.
4. Öppna URL:en och testa att sök/lägg till film fungerar – det bekräftar att miljövariablerna kommit med korrekt.

Framtida ändringar: kör bara `npx vercel --prod` igen för att publicera en ny version. Kopplar du senare projektet till GitHub (Vercel → Settings → Git) sker det automatiskt vid varje push istället.

## Importera befintlig samling från CSV

`supabase/import_dvds.sql` flyttar en gammal DVD-samling (kolumnerna `Title,Year,Rating,Imdb,Time,Location`) rakt in i Supabase. Kör den i **SQL Editor** efter migrationerna (0001–0003), på samma sätt som `seed.sql`.

Ett rent SQL-script kan inte anropa TMDB, så `tmdb_id`/`imdb_id` lämnas `NULL` för dessa filmer (migration `0003_optional_tmdb.sql` gör de kolumnerna valfria). Det innebär att importerade filmer saknar poster, handling, skådespelare och genre på detaljsidan tills de matchas mot TMDB – appen visar "Inte matchad mot TMDB ännu" istället. Bygger vi en matchningsfunktion senare kan den fylla i `tmdb_id`/`imdb_id` i efterhand utan att påverka övrig data.

Scriptet skapar också de platser (`locations`) som förekom i CSV:n, normaliserade så att skiftläges- och mellanslagsskillnader (t.ex. `"drawer H"` / `"Drawer H "`) blir samma plats. Det är designat att köras **en gång** – ingen dubblettkontroll, eftersom det saknas en naturlig nyckel utan `tmdb_id`.

Projektet läser eller beror i övrigt inte på CSV-filen – den behövdes bara för att generera SQL-scriptet.

## Att tänka på

- `user_id`-kolumnen i `movies` och `locations` är förberedd för flera användare men används inte ännu – appen har ingen inloggning i det här steget. `PROXY_SECRET`-skyddet är ett provisorium tills dess.
- Poster, handling, skådespelare och genre cachas inte i databasen utan hämtas från TMDB varje gång de visas, enligt tidigare beslut.
- Lägg till minst en plats under **Inställningar** innan du lägger till din första film, annars är platslistan tom i "Lägg till film"-modalen.
- En plats kan inte tas bort medan den används av en film i samlingen (databasen blockerar det via en foreign key).
