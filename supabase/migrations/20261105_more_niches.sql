-- More niches (admins can still rename or switch them off).
insert into public.niches (name)
select v.name
from (values ('Health & Wellness'), ('Anime & Manga'), ('Art & Design'), ('Business & Finance'),
             ('Education'), ('Entertainment'), ('Music'), ('Pets'), ('Sports'), ('Automotive'),
             ('Other')) as v(name)
where not exists (select 1 from public.niches n where n.name = v.name);
