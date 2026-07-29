-- Platser (placering) blir en egen tabell med förutbestämda värden,
-- hanterade via admin-gränssnittet istället för fri text per film.

create table if not exists locations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid, -- samma multi-user-förberedelse som movies
  name text not null,
  created_at timestamptz not null default now()
);

create unique index if not exists locations_user_name_unique on locations (user_id, name);

alter table locations enable row level security;

create policy "allow all for now" on locations
  for all
  using (true)
  with check (true);

-- Byt movies.location (fri text) mot en referens till locations.
-- Ingen produktionsdata att migrera ännu, så vi kan göra det i ett steg.
alter table movies add column if not exists location_id uuid references locations(id);
alter table movies drop column if exists location;
