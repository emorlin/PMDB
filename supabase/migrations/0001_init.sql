-- Filmsamling: grundschema
-- Eget schema "pmdb" eftersom databasen delas med andra projekt/appar.
-- Endast fält som hämtas en gång vid tillägg lagras här. Poster, handling,
-- skådespelare och genre hämtas alltid live från TMDB (se README).

create schema if not exists pmdb;

-- PostgREST/anon-nyckeln kräver explicita GRANTs för scheman utanför "public".
grant usage on schema pmdb to anon, authenticated;
alter default privileges in schema pmdb grant all on tables to anon, authenticated;
alter default privileges in schema pmdb grant all on sequences to anon, authenticated;

create extension if not exists "pgcrypto";

create table if not exists pmdb.movies (
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

create index if not exists movies_title_idx on pmdb.movies (title);
create index if not exists movies_user_id_idx on pmdb.movies (user_id);
create unique index if not exists movies_user_tmdb_unique on pmdb.movies (user_id, tmdb_id);

alter table pmdb.movies enable row level security;

-- Tillfällig öppen policy tills riktig inloggning finns på plats.
-- Byt ut mot "user_id = auth.uid()" när auth introduceras.
create policy "allow all for now" on pmdb.movies
  for all
  using (true)
  with check (true);

grant all on pmdb.movies to anon, authenticated;
