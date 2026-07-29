-- Städar bort dubbletter i pmdb.movies, t.ex. om import_dvds.sql eller
-- seed.sql råkade köras två gånger (de är inte skyddade mot omkörning).
--
-- Kör steg 1 först för att se hur illa det är. Kör sedan steg 2 för att
-- faktiskt ta bort dubbletterna (behåller den äldsta raden i varje grupp).

-- Steg 1: förhandsgranska (ändrar inget)
select title, year, count(*) as antal
from pmdb.movies
group by title, year, runtime_minutes, my_rating, imdb_rating, location_id, tmdb_id, imdb_id
having count(*) > 1
order by antal desc, title;

-- Steg 2: ta bort dubbletterna (kör bara när du sett resultatet ovan och är nöjd)
delete from pmdb.movies m
using (
  select id,
    row_number() over (
      partition by title, year, runtime_minutes, my_rating, imdb_rating, location_id, tmdb_id, imdb_id
      order by created_at asc, id asc
    ) as rn
  from pmdb.movies
) dup
where m.id = dup.id and dup.rn > 1;
