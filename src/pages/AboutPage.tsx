const GITHUB_URL = 'https://github.com/emorlin/PMDB'

const FEATURES = [
  {
    title: 'Tabellvy',
    text: 'Hela samlingen i en sorterbar tabell – titel, år, rating, IMDb-betyg, speltid och placering.',
  },
  {
    title: 'Upptäck',
    text: 'Bläddra i samlingen som ett postergrid, filtrera på bokstav eller slumpa fram en film att se.',
  },
  {
    title: 'Lägg till film',
    text: 'Sök upp filmen på TMDB – år, speltid och IMDb-betyg fylls i automatiskt. Du väljer bara plats och din egen rating.',
  },
  {
    title: 'Matcha mot TMDB',
    text: 'Äldre filmer som saknar TMDB-koppling går att matcha i efterhand direkt från filmens sida, så poster och handling dyker upp.',
  },
  {
    title: 'Inställningar',
    text: 'Hantera platserna filmerna står på och växla mellan ljust och mörkt tema.',
  },
]

export default function AboutPage() {
  return (
    <div className="max-w-lg">
      <h1 className="text-xl font-medium mb-2">Om PMDB</h1>
      <p className="text-sm text-text-muted leading-relaxed mb-6">
        PMDB är en personlig katalog över min fysiska filmsamling – DVD och Blu-ray. Appen håller
        koll på var varje film står, vad jag själv tyckte om den och vad IMDb tycker. Poster,
        handling, skådespelare och genre visas alltid live från{' '}
        <a
          href="https://www.themoviedb.org"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-text"
        >
          TMDB
        </a>
        , så informationen är aldrig inaktuell.
      </p>

      <section className="mb-6">
        <h2 className="text-sm font-medium text-text-muted mb-3">Funktioner</h2>
        <dl className="flex flex-col gap-3">
          {FEATURES.map((f) => (
            <div key={f.title}>
              <dt className="text-sm font-medium">{f.title}</dt>
              <dd className="text-sm text-text-muted leading-relaxed">{f.text}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section>
        <h2 className="text-sm font-medium text-text-muted mb-2">Källkod</h2>
        <p className="text-sm text-text-muted leading-relaxed mb-2">
          Byggd med React, TypeScript, Tailwind CSS och Supabase, driftsatt på Vercel. Koden är
          öppen på GitHub.
        </p>
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 min-h-11 text-sm hover:bg-surface-2"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="currentColor"
            aria-hidden="true"
            className="shrink-0"
          >
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
          </svg>
          Visa på GitHub
          <span className="sr-only"> (öppnas i ny flik)</span>
        </a>
      </section>
    </div>
  )
}
