# PMDB

> Personlig katalog över en fysisk filmsamling – platser, egen rating och IMDb-betyg, med filmdata hämtat live från TMDB.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white&labelColor=20232A)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38BDF8?logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Postgres-3ECF8E?logo=supabase&logoColor=white)
![Clerk](https://img.shields.io/badge/Auth-Clerk-6C47FF?logo=clerk&logoColor=white)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-installerbar-5A0FC8?logo=pwa&logoColor=white)

---

## Innehåll

- [Vad är PMDB?](#vad-är-pmdb)
- [Funktioner](#funktioner)
- [Teknisk stack](#teknisk-stack)
- [Arkitektur](#arkitektur)
- [Projektstruktur](#projektstruktur)
- [Databasmodell](#databasmodell)
- [PWA & offline-cachning](#pwa--offline-cachning)
- [Säkerhet](#säkerhet)
- [Inloggning & behörighet](#inloggning--behörighet)
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
| **Tabellvy** | Startsida: Titel, År, Rating, IMDb-rating, Tid, Placering – sorterbara kolumner (klick eller tangentbord). Realtidssökning på titel, "endast osedda"-filter, och två statistikrutor (antal filmer / antal osedda). Blir en kortlista med egen sorteringskontroll under `md`-brytpunkten |
| **Detaljsida** | Poster, handling, skådespelare, regissör och genre hämtas alltid live från TMDB (aldrig cachat i databasen). Egen rating, IMDb-rating och placering visas/redigeras, med redigera- och ta bort-funktion (kräver inloggning) |
| **Lägg till film** | Sökmodal mot TMDB, autofyller år/speltid/IMDb-rating; plats och egen rating (1–10) fylls i manuellt. Man hamnar direkt på filmens detaljsida efter tillägg. Kräver inloggning |
| **Matcha mot TMDB i efterhand** | Filmer utan `tmdb_id` (t.ex. CSV-importerade) öppnar automatiskt en sökmodal på detaljsidan så de kan kopplas till TMDB/IMDb senare – utan att röra egen rating eller plats. Kräver inloggning |
| **Upptäck-vy** | Rutnät av den egna samlingen (inte nya filmer att köpa): bokstavsfilter (horisontell A–Ö-rad på desktop, dropdown på mobil), "endast osedda"-filter, slumpknapp, klassisk sidpaginering (48/sida). Bokstav och sidnummer ligger i URL:en (`?letter=B&page=2`) – delbart och webbläsarhistorik fungerar |
| **Inställningar** | Ljust/mörkt tema (sparas i `localStorage`, synligt för alla). Platshanteringen – lägg till, byta namn, ta bort (blockeras om platsen används av en film) – är helt dold tills man loggar in, inte bara knapparna |
| **Om** | Kort, användarvänlig info om appen och dess funktioner, med länk till källkoden på GitHub |
| **Inloggning** | Google-inloggning (via Clerk) krävs för att lägga till, redigera, matcha eller ta bort filmer, samt hantera platser. Bläddra, söka och filtrera är öppet för alla – se [eget avsnitt](#inloggning--behörighet) |
| **Tillgänglighet** | WCAG 2.1 AA: tangentbordsnavigerbar sorterbar tabell, dialog-semantik + fokusfälla i modaler, skip-länk, live-regioner, kontrollerad färgkontrast – se [eget avsnitt](#tillgänglighet) |
| **Installerbar app (PWA)** | Går att lägga till på hemskärm/skrivbord med egen ikon. App-skalet precachas av en service worker och öppnas därför i princip direkt, utan att vänta på nätverket – se [PWA & offline-cachning](#pwa--offline-cachning) |

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
| @clerk/clerk-react | 5 | Inloggning (Google) i klienten – `SignedIn`/`SignedOut`/`UserButton` |
| @clerk/backend | 3 | Verifierar Clerk-sessioner server-side i `api/movies.ts`/`api/locations.ts` |
| @vercel/node | 5 | Typer för Vercel Functions (`api/*.ts`) |
| oxlint | 1 | Rust-baserad linter, snabbare alternativ till ESLint |
| vite-plugin-pwa | 1 | Genererar web app manifest + service worker (Workbox) för installerbarhet och offline-cachning |
| Vercel | – | Statisk hosting + serverless-funktioner för API-proxyn |

Ingen tredjeparts server-state-cache (t.ex. React Query) används – filmlistan cachas istället för hand i en enkel React Context (`MoviesProvider`, se [Arkitektur](#arkitektur)). TMDB-metadata (poster, handling osv.) cachas fortfarande aldrig – bara den egna samlingens grunddata (titel, rating, plats …) från Supabase.

---

## Arkitektur

```
┌───────────────────────────────────────────────────────┐
│  Presentationslager  (src/pages/, src/components/)    │
│  React-komponenter · Tailwind CSS · React Router      │
├───────────────────────────────────────────────────────┤
│  Datalager  (src/lib/movies.ts, locations.ts, …)      │
│  Läsning: direkt mot Supabase · Skrivning: via API     │
├───────────────────────────────────────────────────────┤
│  Serverless proxy  (api/*.ts, Vercel Functions)        │
│  tmdb-*/omdb-rating: döljer API-nycklar                │
│  movies/locations: kräver verifierad Clerk-session     │
├───────────────────────────────────────────────────────┤
│  Databas  (Supabase / Postgres, schema "pmdb")         │
│  movies · locations                                    │
└───────────────────────────────────────────────────────┘
```

**Dataflöde när en film läggs till:**

1. Sökfältet i `AddMovieModal` anropar `GET /api/tmdb-search` via proxyn (klienten ser aldrig `TMDB_API_KEY`)
2. Vald träff hämtar fulla detaljer via `/api/tmdb-movie` samt IMDb-betyg via `/api/omdb-rating`
3. `addMovie()` hämtar en Clerk-token (`useAuth().getToken()`) och skickar den som `Authorization: Bearer …` till `POST /api/movies`, som verifierar sessionen och skriver raden till `pmdb.movies`
4. Appen navigerar direkt till filmens detaljsida (`/movie/:id`)

**Dataflöde när en detaljsida visas:**

1. `MoviesProvider`s cache slås upp på `id` – nästan alltid en träff, eftersom man kom dit via en rad i tabellen/rutnätet. Inget nytt DB-anrop krävs då.
2. Är filmen inte i cachen än (t.ex. en direktlänk innan hela samlingen hunnit laddas) hämtas den enskilt via `getMovie(id)`
3. Finns `tmdb_id`: `getMovieDetails()` hämtar poster/handling/skådespelare/genre **live** från TMDB via proxyn, varje gång sidan visas – ingenting cachas i databasen
4. Saknas `tmdb_id`: `MatchMovieModal` öppnas automatiskt så filmen kan matchas mot TMDB (se [eget avsnitt](#importera-befintlig-samling--matcha-mot-tmdb))

### Cachning av filmlistan

`MoviesProvider` (`src/lib/movies-context.tsx`) wrappar routningen i `main.tsx` och håller hela filmsamlingen i minnet. Eftersom bara `<Outlet />` byts ut vid navigering – inte providern ovanför den – överlever cachen flikbyten:

- Filmlistan hämtas **en gång** vid appstart, inte på nytt varje gång Tabell-, Upptäck- eller en detaljsida monteras.
- All sortering i tabellvyn (`compareMovies()`) sker i klienten mot den redan hämtade listan – att byta sorteringskolumn kräver alltså inget nytt anrop.
- Lägg till/redigera/matcha/ta bort uppdaterar cachen direkt (`addMovieToCache`/`updateMovieInCache`/`removeMovieFromCache`) istället för att trigga en ny hämtning av hela listan.

Innan detta hämtade Tabell- och Upptäck-vyn hela samlingen (1000+ rader) oberoende av varandra vid varje montering – dvs. varje flikbyte – och tabellvyn hämtade dessutom om från databasen vid varje ändrad sorteringskolumn.

---

## Projektstruktur

```
PMDB/
├── api/
│   ├── _lib/
│   │   ├── auth.ts                  # Delad hemlighet-koll (requireProxySecret) för TMDB/OMDb
│   │   ├── clerkAuth.ts             # Verifierar Clerk-token (requireClerkAuth)
│   │   ├── supabase.ts              # Server-side Supabase-klient för movies.ts/locations.ts
│   │   └── parseBody.ts             # Defensiv JSON-body-parsing, delad av movies.ts/locations.ts
│   ├── tmdb-search.ts               # Proxy: TMDB-sökning
│   ├── tmdb-movie.ts                # Proxy: filmdetaljer + credits/external_ids
│   ├── omdb-rating.ts               # Proxy: IMDb-rating via OMDb
│   ├── movies.ts                    # Skyddad: POST/PATCH/DELETE mot pmdb.movies, fält-whitelistat
│   └── locations.ts                 # Skyddad: POST/PATCH/DELETE mot pmdb.locations, fält-whitelistat
├── public/
│   ├── logo.png                     # Logotyp, ljust tema
│   ├── logo-dark.png                # Logotyp, mörkt tema
│   ├── favicon.png / apple-touch-icon.png
│   └── pwa-192.png / pwa-512.png / pwa-maskable-512.png  # PWA-manifestikoner
├── src/
│   ├── components/
│   │   ├── AddMovieModal.tsx        # Sök + lägg till ny film (dialog, fokusfälla)
│   │   ├── MatchMovieModal.tsx      # Matcha en befintlig film mot TMDB i efterhand
│   │   ├── AppLayout.tsx            # Header, nav, inloggningsknapp, footer, <Outlet />
│   │   ├── MovieTable.tsx           # Sorterbar tabell (desktop) / kortlista (mobil)
│   │   ├── MovieTableSkeleton.tsx   # Platshållare medan filmlistan laddas (undviker layouthopp)
│   │   ├── AlphabetFilter.tsx       # A–Ö-filter: horisontell rad (desktop) / dropdown (mobil)
│   │   ├── PosterGrid.tsx           # Responsivt postergrid för Upptäck-vyn
│   │   └── PwaUpdatePrompt.tsx      # "Ny version tillgänglig"-ruta, se PWA & offline-cachning
│   ├── pages/
│   │   ├── MovieTablePage.tsx       # "/" – tabellvy, sök, statistik, lägg till film
│   │   ├── DiscoverPage.tsx         # "/discover" – upptäck egen samling (bokstav/sida i URL:en)
│   │   ├── MovieDetailPage.tsx      # "/movie/:id" – detaljvy, redigera, ta bort, matcha
│   │   ├── AdminPage.tsx            # "/admin" – platser + tema
│   │   └── AboutPage.tsx            # "/om" – info om appen + GitHub-länk
│   ├── lib/
│   │   ├── supabase.ts              # Klient, schema "pmdb" (läsning)
│   │   ├── movies.ts                # Läsning direkt mot Supabase, skrivning via /api/movies
│   │   ├── movies-context.tsx       # MoviesProvider/useMovies – delad cache av filmlistan
│   │   ├── locations.ts             # Läsning direkt mot Supabase, skrivning via /api/locations
│   │   ├── tmdb.ts                  # Klientsidans wrapper mot /api/tmdb-*
│   │   ├── omdb.ts                  # Klientsidans wrapper mot /api/omdb-rating
│   │   ├── proxy.ts                 # Delad hemlighet-header till /api/tmdb-*/omdb-rating
│   │   └── theme-context.tsx        # Ljust/mörkt tema, localStorage-persistens
│   ├── types/
│   │   ├── movie.ts
│   │   └── location.ts
│   ├── App.tsx                      # Routes
│   └── main.tsx                     # ClerkProvider · ThemeProvider · MoviesProvider · BrowserRouter
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

### Två PostgREST-fallgropar bakom `listMovies()`/`compareMovies()`

- **Sortering på `location`** – `locations` hämtas embeddat (`location:locations(name)`). `supabase-js`s `order(col, { referencedTable })` sorterar bara rader *inuti* en till-många-relation; för en till-en-relation som denna har den ingen effekt på föräldraradernas ordning alls (`!inner` hade fixat det, men hade samtidigt uteslutit alla filmer utan plats ur listan). Löst genom att aldrig be PostgREST sortera alls – `listMovies()` hämtar bara data, och `compareMovies()` sorterar hela listan (alla kolumner, inte bara `location`) i klienten istället, se [Cachning av filmlistan](#arkitektur).
- **Rad-gräns på 1000** – PostgREST svarar med max 1000 rader per anrop om man inte sidbryter själv. Vid ~1250 filmer föll allt efter rad 1000 tyst bort – i praktiken nästan alla titlar från sent i alfabetet. `listMovies()` sidbryter nu i loop med `.range()` (1000 åt gången, med `id` som enda sorteringsnyckel för deterministisk sidbrytning – vilken kolumn som helst hade dugt eftersom resultatet ändå sorteras om i klienten) tills hela samlingen hämtats.

---

## PWA & offline-cachning

Appen går att installera som en Progressive Web App – "Lägg till på hemskärmen" på mobil, eller Chrome/Edges "Installera app" på desktop – via `vite-plugin-pwa` (Workbox under huven).

- **App-skalet precachas.** Vid varje produktionsbygge listar service workern all HTML/JS/CSS som ett precache-manifest. Första besöket hämtar dem som vanligt, men varje besök därefter – inklusive öppning av den installerade appen – serveras de direkt från cachen istället för nätverket. Det är den här delen som faktiskt löser "appen tar lång tid att öppna": utan en service worker laddade den installerade genvägen om hela bundlen (JS + CSS) från nätet vid varje öppning, precis som en vanlig flik.
- **Filmdata (Supabase)** cachas med en *stale-while-revalidate*-strategi: senast kända svar visas direkt medan ett färskt anrop görs i bakgrunden och uppdaterar cachen till nästa gång.
- **TMDB-posterbilder** cachas *cache-first* i 30 dagar – de ändras aldrig för en given film, så ett nätverksanrop är onödigt efter första visningen.
- **Uppdateringar.** `registerType: 'prompt'` (inte `autoUpdate`) valdes medvetet – en installerad app som byter kod under användarens fötter utan förvarning är förvirrande. `PwaUpdatePrompt.tsx` (`virtual:pwa-register/react`) visar istället en liten "Ny version tillgänglig – Uppdatera"-ruta så fort en ny build har deployats och användaren väl laddar om eller navigerar.
- **Manifest & ikoner** (`public/pwa-192.png`, `pwa-512.png`, `pwa-maskable-512.png`) definieras i `vite.config.ts` – namn, tema-/bakgrundsfärg (`#0f1115`), `display: "standalone"`, samt en separat maskable-ikon med extra säkerhetsmarginal så OS:ets ikonmaskning (cirkel/rundad kvadrat) inte klipper bort delar av loggan.

**Känt fallgrop:** en genväg som redan lagts till på hemskärmen/skrivbordet *innan* manifestet fanns är bara en vanlig bokmärkes-genväg, inte en riktig installerad PWA. Efter en deploy med detta måste den tas bort och läggas till på nytt för att webbläsaren ska upptäcka manifestet och installera appen på riktigt (med ikon, precache och allt).

Service workern byggs bara i produktionsbygget (`npm run build`) – `vite`/`vercel dev` kör utan den, så den lokala utvecklingsupplevelsen är opåverkad.

---

## Säkerhet

- **API-nycklar aldrig i klienten** – `TMDB_API_KEY`/`OMDB_API_KEY`/`CLERK_SECRET_KEY` finns bara server-side i `api/*.ts` (Vercel Functions). Klienten anropar egna proxy-endpoints istället för TMDB/OMDb/Clerk direkt.
- **Delad hemlighet-header** (`PROXY_SECRET` / `VITE_PROXY_SECRET`) – enkelt skydd mot att slumpmässiga bottar/scanners hittar den publika URL:en och förbrukar TMDB/OMDb-kvoten. **Inte** riktig autentisering: hemligheten skickas från klienten och finns därför i den publika JS-bundeln (`src/lib/proxy.ts`). Gäller bara `tmdb-*`/`omdb-rating` – se [Inloggning & behörighet](#inloggning--behörighet) för hur `movies`/`locations` faktiskt skyddas.
- **Row Level Security** – aktiverat på `pmdb.movies` och `pmdb.locations`, men fortfarande med en öppen policy (`using (true)`) på databasnivå. RLS stoppar alltså inte i sig ett anrop som går direkt mot Supabase med anon-nyckeln. Det faktiska skyddet för skrivoperationer ligger istället i API-lagret (`api/movies.ts`/`api/locations.ts`), som kräver en verifierad Clerk-session innan något skrivs – se nästa avsnitt. Kolumnen `user_id` finns fortfarande förberedd på båda tabellerna för att kunna byta till `auth.uid() = user_id`-policyer om databasen någon gång ska vara fleranvändarmedveten på riktigt.
- **Fält-whitelisting i API-lagret** – `api/movies.ts`/`api/locations.ts` skickar inte request-body:n rakt in i `insert()`/`update()`. En inloggad anropare kunde annars skicka med extra fält (t.ex. `id`, `user_id`, `created_at`) och styra kolumner som inte är tänkta att vara skrivbara via klienten. `pickInsertFields()`/`pickUpdateFields()` plockar bara ut de fält appen faktiskt använder innan anropet når Supabase.
- **Supabase anon-nyckel** – publik med avsikt (Supabases säkerhetsmodell bygger på RLS, inte på en hemlig nyckel). Eftersom databasen delas med andra projekt ligger all PMDB-data i ett eget schema (`pmdb`), separat från andra scheman i samma databas.
- **Secret key** (`sb_secret_...`, eller gamla `service_role`) används aldrig i projektet – den kringgår RLS helt och ska aldrig hamna i klientkod.

---

## Inloggning & behörighet

Google-inloggning via [Clerk](https://clerk.com) krävs för att **lägga till, redigera, matcha eller ta bort filmer**, samt **lägga till/ta bort platser**. Att bläddra, sortera, söka och filtrera i samlingen är öppet för alla, utloggad som inloggad.

Samma Clerk-applikation (samma Google-inloggning) återanvänds från ett annat privat projekt – inget nytt Clerk-konto behöver skapas för att klona och köra PMDB, bara egna nycklar (se [Miljövariabler](#miljövariabler)).

### Klient

`ClerkProvider` wrappar hela appen i `main.tsx`. UI:t använder Clerks inbyggda komponenter:

- `<SignedIn>` / `<SignedOut>` – döljer/visar knappar och formulär beroende på inloggningsstatus (t.ex. "+ Lägg till film", "Redigera", "Ta bort", platshanteringen i Inställningar)
- `<SignInButton mode="modal">` – inloggningsknapp i headern
- `<UserButton>` – profilmeny + utloggning när inloggad
- `useAuth().getToken()` – hämtar en kortlivad sessions-token som skickas med varje skrivanrop

### Server – faktisk enforcement, inte bara dolda knappar

`src/lib/movies.ts` och `src/lib/locations.ts` skriver **inte** längre direkt mot Supabase. Skrivoperationer (`addMovie`, `updateMovie`, `deleteMovie`, `addLocation`, `updateLocation`, `deleteLocation`) går via `fetch` till `/api/movies` respektive `/api/locations`, med token som `Authorization: Bearer <token>`-header. Läsning (`listMovies`, `getMovie`, `listLocations`) går fortfarande direkt mot Supabase som tidigare, eftersom bläddring inte kräver inloggning.

`api/_lib/clerkAuth.ts` verifierar tokenet med `@clerk/backend`s `verifyToken()` innan `api/movies.ts`/`api/locations.ts` rör databasen. Ett anrop utan giltig token får `401` – **även om någon skulle anropa endpointen direkt och hoppa förbi UI:t helt**. Det är den här servern-sida-kontrollen, inte att knapparna råkar vara dolda, som faktiskt skyddar åtgärderna.

### Känd nyans

RLS på `pmdb.movies`/`pmdb.locations` är fortfarande öppen (se [Säkerhet](#säkerhet)) – skyddet sitter i API-lagret, inte i databasen. Ett anrop direkt mot Supabase med anon-nyckeln (utan att gå via `/api/movies`) skulle alltså fortfarande lyckas. Att stänga den luckan helt skulle kräva att koppla Clerk till Supabase som en tredjeparts-auth-leverantör för RLS – inte gjort här, eftersom API-lagret redan täcker appens faktiska anropsvägar.

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

Inloggningsflödet använder Clerks egna UI-komponenter (`SignInButton`, `UserButton`), vars tillgänglighetsimplementering Clerk själva ansvarar för.

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
- En Clerk-applikation med Google aktiverat (se [Skaffa Clerk-nycklar](#skaffa-clerk-nycklar))

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
| `VITE_CLERK_PUBLISHABLE_KEY` | Klient | Nej – avsedd att vara publik |
| `CLERK_SECRET_KEY` | Server (`api/_lib/clerkAuth.ts`) | Ja |
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

### Skaffa Clerk-nycklar

1. Skapa ett konto och en applikation på [clerk.com](https://clerk.com) (eller återanvänd en befintlig applikation om du redan har en)
2. Aktivera **Google** som inloggningsmetod under **Configure → SSO Connections**
3. **Configure → API Keys**:
   - **Publishable key** → `VITE_CLERK_PUBLISHABLE_KEY`
   - **Secret key** → `CLERK_SECRET_KEY`

Localhost fungerar automatiskt för en Clerk-applikation i utvecklingsläge – inga extra domän-inställningar behövs för lokal utveckling.

### I produktion (Vercel)

`.env` committas inte och läses bara lokalt. Lägg in samma åtta variabler under **Project Settings → Environment Variables** i Vercel-dashboarden – annars byggs appen utan dem, och sök/lägg-till-film/inloggning slutar fungera i produktion (401/"Invalid API key") trots att allt ser rätt ut lokalt. En variabel som läggs till *efter* senaste deploy slår heller inte igenom förrän en ny deploy körs.

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

`vercel.json` innehåller SPA-rewrites som skickar varje route till `index.html`:

```json
{
  "rewrites": [
    { "source": "/discover", "destination": "/index.html" },
    { "source": "/admin", "destination": "/index.html" },
    { "source": "/om", "destination": "/index.html" },
    { "source": "/movie/:id", "destination": "/index.html" }
  ]
}
```

Utan detta svarar Vercel 404 vid direktladdning eller omladdning av allt utom startsidan – en vanlig fallgrop för SPA:er utan ett ramverk som hanterar routingen åt en. Lägg till en ny rad här varje gång en ny toppnivå-route läggs till i `App.tsx`.

Rewrites är medvetet en **explicit lista** och inte en wildcard (`"source": "/(.*)"`), trots att det är det vanligaste mönstret för Vite-SPA:er på Vercel. Anledningen: `vercel dev` kör samma rewrites lokalt, men i dev-läge är `src/main.tsx`, `/@vite/client` m.fl. inte riktiga filer på disk (de serveras dynamiskt av Vite) – en wildcard-rewrite fångar då även dem och skickar `index.html` istället för riktig JS till dem, vilket kraschar hela dev-servern. En explicit lista över appens faktiska routes träffar aldrig Vites interna sökvägar eller `/api/*`, och fungerar identiskt i produktion där Vercel ändå matchar de riktiga byggda filerna i `dist/` före rewrites.

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

- RLS på `pmdb.movies`/`pmdb.locations` är fortfarande öppen (`using (true)`) på databasnivå – skyddet för skrivoperationer sitter i API-lagret (Clerk-verifiering), inte i Supabase. Ett anrop direkt mot Supabase med anon-nyckeln skulle fortfarande lyckas. Se [Inloggning & behörighet](#inloggning--behörighet).
- `requireClerkAuth` verifierar bara att sessionen är giltig, inte vem den tillhör – ett medvetet val. Eftersom Clerk-appen är återanvänd från ett annat projekt kan alltså vem som helst med ett konto där också hantera filmer/platser här, inte bara ägaren. En ägar-koll (jämför sessionens user-id mot ett hårdkodat värde) diskuterades men valdes bort.
- `user_id`-kolumnerna i `movies` och `locations` är fortfarande förberedda men oanvända – appen har bara en användarroll (inloggad/utloggad), inte separata datamängder per person.
- `PROXY_SECRET`-skyddet (TMDB/OMDb) är ett enkelt bot-filter, inte riktig autentisering – hemligheten skickas från och finns i klientens JS-bundle.
- Importerade filmer (via CSV) saknar `tmdb_id`/`imdb_id` tills de matchas manuellt via **"Matcha mot TMDB"** på respektive detaljsida – ingen bulk-matchning finns ännu.
- Inga automatiska tester ännu.
- En hemskärms-/skrivbordsgenväg som lades till innan PWA-manifestet infördes räknas inte som en riktig installation – se [PWA & offline-cachning](#pwa--offline-cachning).

---

*Byggd med React, TypeScript, Supabase & Vercel.*
