-- Tillåter import av gammal samling utan TMDB-matchning på plats.
-- Filmer med tmdb_id/imdb_id null saknar poster/handling/skådespelare
-- tills de matchas mot TMDB senare.

alter table pmdb.movies alter column tmdb_id drop not null;
alter table pmdb.movies alter column imdb_id drop not null;
