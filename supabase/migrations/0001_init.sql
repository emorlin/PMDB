-- Filmsamling: grundschema
-- Endast fält som hämtas en gång vid tillägg lagras här. Poster, handling,
-- skådespelare och genre hämtas alltid live från TMDB (se README).

create extension if not exists "pgcrypto";

create table if not exists movies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid, -- förberedd för flera användare, null = enda användaren tills vidare
  tmdb_id integer not null,
  imdb_id text not null,
  title text not null,
  year integer,
  runtime_minutes integer,
  my_rating integer check (my_rating between 1 and 10),
  imdb_rating numeric(3, 1),
  location text,
  created_at timestamptz not null default now()
);

create index if not exists movies_title_idx on movies (title);
create index if not exists movies_user_id_idx on movies (user_id);
create unique index if not exists movies_user_tmdb_unique on movies (user_id, tmdb_id);

alter table movies enable row level security;

-- Tillfällig öppen policy tills riktig inloggning finns på plats.
-- Byt ut mot "user_id = auth.uid()" när auth introduceras.
create policy "allow all for now" on movies
  for all
  using (true)
  with check (true);
