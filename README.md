# PMDB

> Personlig katalog över en fysisk filmsamling – platser, egen rating och IMDb-betyg, med filmdata hämtat live från TMDB.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white&labelColor=20232A)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38BDF8?logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Postgres-3ECF8E?logo=supabase&logoColor=white)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel&logoColor=white)

---

## Innehåll

- [Vad är PMDB?](#vad-är-pmdb)
- [Funktioner](#funktioner)
- [Teknisk stack](#teknisk-stack)
- [Arkitektur](#arkitektur)
- [Projektstruktur](#projektstruktur)
- [Databasmodell](#databasmodell)
- [Säkerhet](#säkerhet)
- [Responsiv design](#responsiv-design)
- [Tillgänglighet](#tillgänglighet)
- [Importera befintlig samling & matcha mot TMDB](#importera-befintlig-samling--matcha-mot-tmdb)
- [Komma igång](#komma-igång)
- [Miljövariabler](#miljövariabler)
- [Supabase – setup](#supabase--setup)
- [Bygga & driftsätta](#bygga--driftsätta)
- [Designsystem](#designsystem)
- [Kända begränsningar](#kända-begränsningar)

---

## Vad är PMDB?

PMDB är en personlig katalog över en fysisk filmsamling (DVD/Blu-ray): vilken hylla eller låda varje film står i, vad man själv tyckte om den, och vad IMDb tycker. Istället för att lagra filmdata i databasen – poster, handling, skådespelare, genre – hämtas det alltid **live från TMDB** när en film visas, så samlingen aldrig blir inaktuell eller kräver underhåll när TMDB uppdaterar sina uppgifter.

Byggd som ett litet, fokuserat projekt: en användare, en samling, inget cachningslager för filmdata, och en tunn serverless-proxy vars enda jobb är att hålla TMDB- och OMDb-nycklarna borta från klienten.

---

## Funktioner

| Funktion | Beskrivning |
|---|---|
| **Tabellvy** | Startsida: Titel, År, Rating, IMDb-rating, Tid, Placering – sorterbara kolumner (klick eller tangentbord). Blir en kortlista med egen sorteringskontroll under `md`-brytpunkten |
| **Detaljsida** | Poster, handling, skådespelare, regissör och genre hämtas alltid live från TMDB (aldrig cachat i databasen). Egen rating, IMDb-rating och placering visas/redigeras, med redigera- och ta bort-funktion |
| **Lägg till film** | Sökmodal mot TMDB, autofyller år/speltid/IMDb-rating; plats och egen rating (1–10) fylls i manuellt. Man hamnar direkt på filmens detaljsida efter tillägg |
| **Matcha mot TMDB i efterhand** | Filmer utan `tmdb_id` (t.ex. CSV-importerade) öppnar automatiskt en sökmodal på detaljsidan så de kan kopplas till TMDB/IMDb senare – utan att röra egen rating eller plats |
| **Upptäck-vy** | Rutnät av den egna samlingen (inte nya filmer att köpa): bokstavsfilter (horisontell A–Ö-rad på desktop, dropdown på mobil), "endast osedda"-filter, slumpknapp, klassisk sidpaginering (48/sida) |
| **Inställningar** | Hantera platser – lägg till/ta bort (blockeras om platsen används av en film) – samt ljust/mörkt tema (sparas i `localStorage`) |
| **Tillgänglighet** | WCAG 2.1 AA: tangentbordsnavigerbar sorterbar tabell, dialog-semantik + fokusfälla i modaler, skip-länk, live-regioner, kontrollerad färgkontrast – se [eget avsnitt](#tillgänglighet) |

---

## Teknisk stack

| Verktyg | Version | Syfte |
|---|---|---|
| React | 19 | UI-ramverk, funktionella komponenter med hooks |
| TypeScript | 6 | Strikt typning end-to-end |
| Vite | 8 | Byggverktyg med snabb HMR och ESM-baserat flöde |
| Tailwind CSS | 4 | Utility-first CSS, CSS-first config (`@theme` i `index.css`, ingen `tailwind.config.*`) |
| React Router | 7 | Klientbaserad routing med `Outlet`-mönster |
| @supabase/supabase-js | 2 | Typat klient-API mot Postgres |
| @vercel/node | 5 | Typer för Vercel Functions (`api/*.ts`) |
| oxlint | 1 | Rust-baserad linter, snabbare alternativ till ESLint |
| Vercel | – | Statisk hosting + serverless-funktioner för API-proxyn |

Ingen server-state-cache (t.ex. React Query) används – appen är liten nog att klara sig med raka `async`-funktioner i `src/lib/` och lokal komponent-state. Filmdata cachas heller aldrig, så det finns ingen cache att invalidera.

---

## Arkitektur

```
┌───────────────────────────────────────────────────────┐
│  Presentationslager  (src/pages/, src/components/)    │
│  React-komponenter · Tailwind CSS · React Router      │
├───────────────────────────────────────────────────────┤
│  Datalager  (src/lib/movies.ts, locations.ts, …)      │
│  Rena async-funktioner mot Supabase-klienten           │
├───────────────────────────────────────────────────────┤
│  Serverless proxy  (api/*.ts, Vercel Functions)        │
│  Döljer TMDB_API_KEY / OMDB_API_KEY för klienten        │
├───────────────────────────────────────────────────────┤
│  Databas  (Supabase / Postgres, schema "pmdb")         │
│  movies · locations                                    │
└───────────────────────────────────────────────────────┘
```

**Dataflöde när en film läggs till:**

1. Sökfältet i `AddMovieModal` anropar `GET /api/tmdb-search` via proxyn (klienten ser aldrig `TMDB_API_KEY`)
2. Vald träff hämtar fulla detaljer via `/api/tmdb-movie` samt IMDb-betyg via `/api/omdb-rating`
3. `addMovie()` skriver raden till `pmdb.movies` i Supabase
4. Appen navigerar direkt till filmens detaljsida (`/movie/:id`)

**Dataflöde när en detaljsida visas:**

1. `getMovie(id)` hämtar den sparade raden från Supabase (egen rating, plats, `tmdb_id`/`imdb_id`)
2. Finns `tmdb_id`: `getMovieDetails()` hämtar poster/handling/skådespelare/genre **live** från TMDB via proxyn, varje gång sidan visas – ingenting cachas i databasen
3. Saknas `tmdb_id`: `MatchMovieModal` öppnas automatiskt så filmen kan matchas mot TMDB (se [eget avsnitt](#importera-befintlig-samling--matcha-mot-tmdb))

---

## Projektstruktur

```
PMDB/
├── api/
│   ├── _lib/
│   │   └── auth.ts                  # Delad hemlighet-koll (requireProxySecret)
│   ├── tmdb-search.ts               # Proxy: TMDB-sökning
│   ├── tmdb-movie.ts                # Proxy: filmdetaljer + credits/external_ids
│   └── omdb-rating.ts               # Proxy: IMDb-rating via OMDb
├── src/
│   ├── components/
│   │   ├── AddMovieModal.tsx        # Sök + lägg till ny film (dialog, fokusfälla)
│   │   ├── MatchMovieModal.tsx      # Matcha en befintlig film mot TMDB i efterhand
│   │   ├── AppLayout.tsx            # Header, nav, skip-länk, <Outlet />
│   │   ├── MovieTable.tsx           # Sorterbar tabell (desktop) / kortlista (mobil)
│   │   ├── AlphabetFilter.tsx       # A–Ö-filter: horisontell rad (desktop) / dropdown (mobil)
│   │   └── PosterGrid.tsx           # Responsivt postergrid för Upptäck-vyn
│   ├── pages/
│   │   ├── MovieTablePage.tsx       # "/" – tabellvy + lägg till film
│   │   ├── DiscoverPage.tsx         # "/discover" – upptäck egen samling
│   │   ├── MovieDetailPage.tsx      # "/movie/:id" – detaljvy, redigera, ta bort, matcha
│   │   └── AdminPage.tsx            # "/admin" – platser + tema
│   ├── lib/
│   │   ├── supabase.ts              # Klient, schema "pmdb"
│   │   ├── movies.ts                # CRUD mot pmdb.movies
│   │   ├── locations.ts             # CRUD mot pmdb.locations
│   │   ├── tmdb.ts                  # Klientsidans wrapper mot /api/tmdb-*
│   │   ├── omdb.ts                  # Klientsidans wrapper mot /api/omdb-rating
│   │   ├── proxy.ts                 # Delad hemlighet-header till /api/*
│   │   └── theme-context.tsx        # Ljust/mörkt tema, localStorage-persistens
│   ├── types/
│   │   ├── movie.ts
│   │   └── location.ts
│   ├── App.tsx                      # Routes
│   └── main.tsx
├── supabase/
│   ├── migrations/                  # 0001_init · 0002_locations · 0003_optional_tmdb
│   ├── seed.sql                     # Testdata (16 filmer, 5 platser)
│   ├── import_dvds.sql              # Engångsimport av riktig DVD-samling
│   └── dedupe_movies.sql            # Städscript ifall importen råkar köras dubbelt
├── vercel.json                      # SPA-rewrite (annars 404 på djuplänkar)
└── .env.example
```

---

## Databasmodell

Postgres via Supabase, i ett eget schema `pmdb` (databasen delas med andra projekt – se [Supabase – setup](#supabase--setup)).

```sql
create schema if not exists pmdb;

create table pmdb.locations (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid, -- förberedd för fler användare, oanvänd tills vidare
  name        text not null,
  created_at  timestamptz not null default now()
);

create unique index locations_user_name_unique on pmdb.locations (user_id, name);

create table pmdb.movies (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid,                  -- samma multi-user-förberedelse
  tmdb_id          integer,               -- null = ej matchad mot TMDB ännu
  imdb_id          text,                  -- null = ej matchad
  title            text not null,
  year             integer,
  runtime_minutes  integer,
  my_rating        integer check (my_rating between 1 and 10),
  imdb_rating      numeric(3, 1),
  location_id      uuid references pmdb.locations(id),
  created_at       timestamptz not null default now()
);

create index movies_title_idx on pmdb.movies (title);
create unique index movies_user_tmdb_unique on pmdb.movies (user_id, tmdb_id);
```

Byggs upp av tre migrationer i `supabase/migrations/`: `0001_init.sql` skapar schemat och `movies`, `0002_locations.sql` lägger till `locations` och byter `movies.location` (fri text) mot `location_id` (FK), `0003_optional_tmdb.sql` gör `tmdb_id`/`imdb_id` valfria så CSV-importerade filmer kan sparas utan TMDB-matchning. `movies_user_tmdb_unique` är fortfarande giltig med `tmdb_id = null`, eftersom Postgres unika index behandlar `NULL` som distinkta värden – flera omatchade filmer kan alltså samexistera.

---

## Säkerhet

- **API-nycklar aldrig i klienten** – `TMDB_API_KEY`/`OMDB_API_KEY` finns bara server-side i `api/*.ts` (Vercel Functions). Klienten anropar egna proxy-endpoints (`/api/tmdb-search`, `/api/tmdb-movie`, `/api/omdb-rating`) istället för TMDB/OMDb direkt.
- **Delad hemlighet-header** (`PROXY_SECRET` / `VITE_PROXY_SECRET`) – enkelt skydd mot att slumpmässiga bottar/scanners hittar den publika URL:en och förbrukar TMDB/OMDb-kvoten. **Inte** riktig autentisering: hemligheten skickas från klienten och finns därför i den publika JS-bundeln (`src/lib/proxy.ts`).
- **Row Level Security** – aktiverat på `pmdb.movies` och `pmdb.locations`, men med en tillfällig öppen policy (`using (true)`) eftersom ingen inloggning finns ännu. RLS ger alltså inget faktiskt skydd i nuläget – appen förlitar sig på att URL:en inte är känd. Kolumnen `user_id` finns förberedd på båda tabellerna för att kunna byta till `auth.uid() = user_id`-policyer den dagen inloggning införs, utan schemaändring.
- **Supabase anon-nyckel** – publik med avsikt (Supabases säkerhetsmodell bygger på RLS, inte på en hemlig nyckel). Eftersom databasen delas med andra projekt ligger all PMDB-data i ett eget schema (`pmdb`), separat från andra scheman i samma databas.
- **Secret key** (`sb_secret_...`, eller gamla `service_role`) används aldrig i projektet – den kringgår RLS helt och ska aldrig hamna i klientkod.

---

## Responsiv design

Brytpunkt: `md` (768 px). Under = mobil, över = desktop.

| | Mobil | Desktop |
|---|---|---|
| Filmtabell | Kortlista (stack) + egen sorteringsdropdown | Sorterbar `<table>` med klickbara kolumnrubriker |
| A–Ö-filter (Upptäck) | Dropdown (`<select>`) | Horisontell rad ovanför postergridet |
| Postergrid | 2 kolumner | 3–6 kolumner beroende på skärmbredd |
| Lägg till/Matcha-modal | Fullbredd med padding, `max-h-[90vh]` + scroll | Samma modal, `max-w-md` |
| Filmdetalj | Poster staplad ovanför text, centrerad | Poster och text sida vid sida |
| Navigation | Radbrytande header | Samma header, mer bredd |
| Touch-mål | Minst 44 px höjd på primära knappar | N/A |

---

## Tillgänglighet

PMDB är byggt med **WCAG 2.1 AA** som riktlinje.

| Område | Implementerat |
|---|---|
| **Skip-länk** | Dold länk ("Hoppa till innehåll") blir synlig vid `Tab`-fokus och flyttar fokus till `<main id="main-content">` |
| **Sidspråk** | `<html lang="sv">` |
| **Landmärken** | `<header>`, `<nav aria-label="Huvudmeny">`, `<main>` |
| **Fokusring** | Global `:focus-visible`-stil (2 px outline, temaanpassad `--focus`-färg) – synlig vid tangentbordsfokus, inte vid musklick |
| **Färgkontrast** | Egna `--accent-text`- och `--danger`-tokens (utöver `--accent`) håller minst 4,5:1 mot bakgrunden i båda teman. Den råa `--accent`-färgen klarar bara ~3,9:1 som text och används därför enbart som knappbakgrund/kantlinje, aldrig som textfärg |
| **Modalsemantik** | `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, `Escape` stänger, klick på bakgrunden stänger, egen fokusfälla (`Tab` cyklar inom modalen), `body`-scroll låst medan öppen – i `AddMovieModal` och `MatchMovieModal` |
| **Tabellstruktur** | `scope="col"` + `aria-sort="ascending"/"descending"/"none"` på sorterbara `<th>`; sorteringen styrs av riktiga `<button>`-element inuti `<th>`, inte ett klick på `<th>` som inte går att nå med tangentbord |
| **Responsiv tabell** | Under `md`-brytpunkten ersätts `<table>` av en semantisk `<ul>`-kortlista med egen sorteringskontroll, så funktionaliteten bevaras – inte bara omflutet visuellt |
| **ARIA-states** | `aria-pressed` på filterknappar (tema, A–Ö-filter), `aria-sort` på tabellrubriker |
| **Live-regioner** | `aria-live="polite"` på sökresultat och sidnumrering, `role="status"` på laddningstexter, `role="alert"` på felmeddelanden |
| **Formulärfält** | Alla `input`/`select` har en kopplad `<label>` (synlig eller `sr-only`) – aldrig bara en `placeholder` |
| **Touch-mål** | Primära knappar minst 44×44 px (`min-h-11`), övriga minst WCAG 2.2:s 24×24 px-minimum |
| **Rörelsereducering** | `prefers-reduced-motion: reduce` stänger av transitions/animationer |

---

## Importera befintlig samling & matcha mot TMDB

`supabase/import_dvds.sql` flyttar en äldre DVD-samling (kolumnerna `Title,Year,Rating,Imdb,Time,Location`) rakt in i Supabase. Kör den i **SQL Editor** efter migrationerna, på samma sätt som `seed.sql`.

Ett rent SQL-script kan inte anropa TMDB, så `tmdb_id`/`imdb_id` lämnas `NULL` för importerade filmer (möjliggjort av `0003_optional_tmdb.sql`). De saknar därför poster, handling, skådespelare och genre på detaljsidan tills de matchas – appen visar "Inte matchad mot TMDB ännu" istället.

Scriptet skapar även de platser som förekom i CSV:n, normaliserade så att skiftläges- och mellanslagsskillnader blir samma plats. Designat att köras **en gång** – ingen dubblettkontroll, eftersom det saknas en naturlig nyckel utan `tmdb_id`. `supabase/dedupe_movies.sql` städar upp om det ändå råkar köras dubbelt. Projektet läser eller beror i övrigt inte på CSV-filen.

### Matcha äldre filmer mot TMDB i efterhand

Så snart en film utan `tmdb_id` öppnas visas automatiskt en sökmodal (`MatchMovieModal`) med titeln förifylld. Användaren väljer rätt träff i listan, appen hämtar filmens `tmdb_id`, `imdb_id` och (via OMDb) `imdb_rating`, och sparar dem på den befintliga raden – egen rating och plats rörs inte. Stängs modalen utan att en film väljs finns en **"Matcha mot TMDB"**-knapp kvar på sidan för att öppna den igen senare.

---

## Komma igång

### Förutsättningar

- Node.js ≥ 18
- Ett Supabase-projekt (kan gärna dela databas med andra projekt, se [Supabase – setup](#supabase--setup))
- Ett TMDB-konto + API-nyckel
- En OMDb API-nyckel

### Installation

```bash
git clone https://github.com/emorlin/PMDB.git
cd PMDB
npm install
cp .env.example .env
# Fyll i värdena, se Miljövariabler nedan
```

### Kör lokalt

`/api`-funktionerna (TMDB/OMDb-proxyn) kräver Vercels serverless-miljö, inte bara Vite. Kör därför:

```bash
npx vercel dev
```

**direkt i terminalen** – inte via `npm run dev` (paketets `dev`-script är bara `vite`, så `vercel dev` skulle annars försöka starta sig självt och krascha med ett "recursive invocation"-fel). Första gången ber CLI:t dig logga in och länka projektet till ett Vercel-konto (gratis, engångssteg).

Appen är sedan tillgänglig på `http://localhost:3000` (eller nästa lediga port – `vercel dev` skriver ut adressen i terminalen och väljer en annan port om 3000 redan är upptagen).

Vill du bara jobba med gränssnittet utan `/api`-anropen räcker `npm run dev` (ren Vite) – men då fungerar inte sök eller lägg till film, eftersom de går via proxyn.

### Tillgängliga kommandon

```bash
npm run dev       # Vite dev-server, utan /api-proxyn (se ovan)
npx vercel dev     # Full lokal miljö inklusive /api-proxyn – kör direkt, inte via npm run
npm run build      # TypeScript-check (tsc -b) + produktionsbuild till dist/
npm run preview    # Förhandsgranska produktionsbundlen lokalt
npm run lint       # oxlint över hela kodbasen
```

---

## Miljövariabler

| Variabel | Används i | Hemlig? |
|---|---|---|
| `VITE_SUPABASE_URL` | Klient | Nej – avsedd att vara publik |
| `VITE_SUPABASE_ANON_KEY` | Klient | Nej – skyddas av RLS, inte av att nyckeln är hemlig |
| `VITE_PROXY_SECRET` | Klient (skickas som header) | Svagt skydd, se [Säkerhet](#säkerhet) |
| `PROXY_SECRET` | Server (`api/_lib/auth.ts`) | Svagt skydd, se [Säkerhet](#säkerhet) |
| `TMDB_API_KEY` | Server (`api/tmdb-*.ts`) | Ja |
| `OMDB_API_KEY` | Server (`api/omdb-rating.ts`) | Ja |

`PROXY_SECRET` och `VITE_PROXY_SECRET` ska vara **identiska**. Generera en slumpad sträng:

```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

### Skaffa TMDB-nyckel

1. Skapa konto på [themoviedb.org](https://www.themoviedb.org)
2. Kontoinställningar → **API** → begär en nyckel (välj "Developer")
3. Kopiera **API Key (v3 auth)** → `TMDB_API_KEY`

### Skaffa OMDb-nyckel

1. [omdbapi.com/apikey.aspx](https://www.omdbapi.com/apikey.aspx) → gratisnivån (1000 anrop/dag)
2. Aktivera via länken som skickas till din mejl
3. Klistra in → `OMDB_API_KEY`

### I produktion (Vercel)

`.env` committas inte och läses bara lokalt. Lägg in samma sex variabler under **Project Settings → Environment Variables** i Vercel-dashboarden – annars byggs appen utan dem, och sök/lägg-till-film slutar fungera i produktion (401/"Invalid API key") trots att allt ser rätt ut lokalt. En variabel som läggs till *efter* senaste deploy slår heller inte igenom förrän en ny deploy körs.

---

## Supabase – setup

Filmsamlingen delar Supabase-projekt med andra appar (typiskt om kontot bara har ett fåtal projekt att tillgå). Alla tabeller ligger därför i ett eget Postgres-schema, `pmdb`, separat från `public` och andra scheman i samma databas.

1. Öppna **SQL Editor** i Supabase-projektet och kör filerna i `supabase/migrations/` i nummerordning: `0001_init.sql` → `0002_locations.sql` → `0003_optional_tmdb.sql`. De skapar schemat `pmdb`, tabellerna `movies`/`locations`, samt de GRANTs som krävs för att PostgREST/anon-nyckeln ska nå ett schema utanför `public`.
2. **Viktigt:** **Project Settings → API → Data API Settings → Exposed schemas** – lägg till `pmdb` (bara `public` är exponerat som standard). Utan detta steget svarar Supabase med ett schema-fel så fort appen försöker läsa eller skriva.
3. (Valfritt, testdata) Kör `supabase/seed.sql` – 5 platser och 16 kända filmer med riktiga TMDB/IMDb-id:n, så poster/handling/skådespelare går att se direkt. Säker att köra flera gånger.
4. Hämta nyckeln via **Connect**-knappen på projektsidan, eller **Settings → API Keys**:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **Publishable key** (`sb_publishable_...`) → `VITE_SUPABASE_ANON_KEY` – den nya ersättaren för den gamla anon-JWT:en. Båda funkar, namnet på env-variabeln spelar ingen roll för koden.

**Använd aldrig Secret key** (`sb_secret_...`, eller gamla `service_role`). Connect-dialogen visar ofta båda i samma kodsnutt – bara den publika/publishable nyckeln ska in i `.env`. Secret key kringgår RLS helt och ska aldrig hamna i klientkod eller i det här projektet över huvud taget.

---

## Bygga & driftsätta

### Produktionsbuild

```bash
npm run build
# tsc -b (typecheck) + vite build → dist/
```

### Deploy till Vercel

Projektet är länkat till ett Vercel-projekt (skapat via `vercel dev`/`vercel --prod`, sparat i `.vercel/` som inte committas).

```bash
npx vercel --prod
```

Kopplas repot till GitHub (Vercel → Settings → Git) sker deploy automatiskt vid varje push till main istället.

`vercel.json` innehåller en SPA-rewrite som skickar alla routes till `index.html`:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Utan den svarar Vercel 404 vid direktladdning eller omladdning av allt utom startsidan (t.ex. `/movie/:id` eller `/discover`) – en vanlig fallgrop för SPA:er utan ett ramverk som hanterar routingen åt en. Vercel matchar statiska filer och serverless-funktioner (`/api/*`) före rewrites, så API-proxyn påverkas inte av regeln.

---

## Designsystem

Färger exponeras som CSS-variabler i `src/index.css` och nås i Tailwind via `@theme`-mappningen (`--color-bg`, `--color-accent`, …), t.ex. `bg-bg`, `text-text-muted`, `border-border`.

### Tema

Ljust/mörkt läge styrs av klassen `.dark` på `<html>`, satt via `ThemeProvider` (`src/lib/theme-context.tsx`). Valet sparas i `localStorage` (`pmdb-theme`); standard är mörkt.

### Färgpalett

| CSS-variabel | Ljust läge | Mörkt läge | Användning |
|---|---|---|---|
| `--bg` | `#ffffff` | `#0f1115` | Sidbakgrund |
| `--surface` | `#f7f7f8` | `#171a21` | Modaler, kort |
| `--surface-2` | `#eef0f3` | `#1f232c` | Inputs, hover-bakgrund, aktiv rad |
| `--border` | `#e2e4e8` | `#2b2f3a` | Kantlinjer |
| `--text` | `#16171d` | `#e6e6e6` | Primärtext |
| `--text-muted` | `#6b7280` | `#9aa0ab` | Etiketter, metadata (≥4,5:1 mot bakgrunden) |
| `--accent` | `#b8742f` | `#e0a95c` | Knappbakgrund, kantlinje – **inte** text (se nedan) |
| `--accent-text` | `#92400e` | `#e0a95c` | Text/aktiva states – garanterat ≥4,5:1 mot bakgrunden |
| `--danger` | `#dc2626` | `#f87171` | Felmeddelanden, ta bort-knapp |
| `--focus` | = `--accent-text` | = `--accent` | Fokusring (`:focus-visible`) |

`--accent` och `--accent-text` är medvetet olika i ljust läge: den råa accentfärgen (`#b8742f`) håller bara ~3,9:1 kontrast som text mot vit bakgrund (under WCAG AA:s krav på 4,5:1), men fungerar fint som knappbakgrund bakom svart text (~5,4:1) eller som kantlinje (icke-text kräver bara 3:1). `--accent-text` är en mörkare nyans avsedd enbart för text ovanpå bakgrunden. I mörkt läge räcker en och samma färg till båda syftena.

### Radier & övergångar

`rounded-md` (knappar, inputs, kort) och `rounded-lg`/`rounded-xl` (modaler, poster) genomgående. Hover/fokus-övergångar hålls korta och stängs av helt vid `prefers-reduced-motion: reduce`.

---

## Kända begränsningar

- Ingen inloggning ännu – `user_id`-kolumnerna i `movies` och `locations` är förberedda för flera användare men oanvända; RLS-policyerna är tillfälligt öppna (`using (true)`) tills auth införs.
- `PROXY_SECRET`-skyddet är ett enkelt bot-filter, inte riktig autentisering – hemligheten skickas från och finns i klientens JS-bundle.
- Importerade filmer (via CSV) saknar `tmdb_id`/`imdb_id` tills de matchas manuellt via **"Matcha mot TMDB"** på respektive detaljsida – ingen bulk-matchning finns ännu.
- Inga automatiska tester ännu.

---

*Byggd med React, TypeScript, Supabase & Vercel.*
