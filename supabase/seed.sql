-- Dummy-data för att testa UX/UI. Kör i SQL Editor EFTER migrationerna
-- (0001_init.sql, 0002_locations.sql, 0003_optional_tmdb.sql). Säker att köra flera gånger.
--
-- Riktiga TMDB- och IMDb-id:n används så att poster, handling, skådespelare
-- och genre verkligen går att hämta live från TMDB i appen. imdb_rating är
-- hårdkodad här (inte hämtad via OMDb) eftersom det bara är testdata.

insert into pmdb.locations (name)
select v.name
from (values ('Hylla 1'), ('Hylla 2'), ('Hylla 3'), ('Byrå'), ('Låda A')) as v(name)
where not exists (select 1 from pmdb.locations l where l.name = v.name);

insert into pmdb.movies (tmdb_id, imdb_id, title, year, runtime_minutes, my_rating, imdb_rating, location_id)
select v.tmdb_id, v.imdb_id, v.title, v.year, v.runtime_minutes, v.my_rating, v.imdb_rating, v.location_id
from (
  values
    (278, 'tt0111161', 'The Shawshank Redemption', 1994, 142, 10, 9.3,
      (select id from pmdb.locations where name = 'Hylla 1')),
    (238, 'tt0068646', 'The Godfather', 1972, 175, 9, 9.2,
      (select id from pmdb.locations where name = 'Hylla 1')),
    (155, 'tt0468569', 'The Dark Knight', 2008, 152, 9, 9.0,
      (select id from pmdb.locations where name = 'Hylla 2')),
    (680, 'tt0110912', 'Pulp Fiction', 1994, 154, 8, 8.9,
      (select id from pmdb.locations where name = 'Hylla 2')),
    (13, 'tt0109830', 'Forrest Gump', 1994, 142, null, 8.8,
      (select id from pmdb.locations where name = 'Hylla 3')),
    (27205, 'tt1375666', 'Inception', 2010, 148, 8, 8.8,
      (select id from pmdb.locations where name = 'Hylla 3')),
    (603, 'tt0133093', 'The Matrix', 1999, 136, 9, 8.7,
      (select id from pmdb.locations where name = 'Byrå')),
    (550, 'tt0137523', 'Fight Club', 1999, 139, null, 8.8,
      (select id from pmdb.locations where name = 'Byrå')),
    (157336, 'tt0816692', 'Interstellar', 2014, 169, 9, 8.7,
      (select id from pmdb.locations where name = 'Låda A')),
    (496243, 'tt6751668', 'Parasite', 2019, 132, 8, 8.5,
      (select id from pmdb.locations where name = 'Låda A')),
    (120, 'tt0120737', 'The Lord of the Rings: The Fellowship of the Ring', 2001, 178, 10, 8.9,
      (select id from pmdb.locations where name = 'Hylla 1')),
    (129, 'tt0245429', 'Spirited Away', 2001, 125, null, 8.6, null),
    (274, 'tt0102926', 'The Silence of the Lambs', 1991, 118, 8, 8.6,
      (select id from pmdb.locations where name = 'Hylla 2')),
    (98, 'tt0172495', 'Gladiator', 2000, 155, 7, 8.5, null),
    (244786, 'tt2582802', 'Whiplash', 2014, 106, 9, 8.5,
      (select id from pmdb.locations where name = 'Hylla 3')),
    (419430, 'tt5052448', 'Get Out', 2017, 104, null, 7.7,
      (select id from pmdb.locations where name = 'Byrå'))
) as v(tmdb_id, imdb_id, title, year, runtime_minutes, my_rating, imdb_rating, location_id)
where not exists (select 1 from pmdb.movies m where m.tmdb_id = v.tmdb_id);
