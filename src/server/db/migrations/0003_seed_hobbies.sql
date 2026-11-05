-- Starting hobby list, taken from the onboarding and explore designs.
-- Safe to run twice. To add hobbies later, write a new migration; never edit
-- this one after it is applied. Slugs never change once used in links.

insert into public.hobbies (name, slug) values
  ('Baking', 'baking'),
  ('Bookbinding', 'bookbinding'),
  ('Bouldering', 'bouldering'),
  ('Calligraphy', 'calligraphy'),
  ('Candle making', 'candle-making'),
  ('Crochet', 'crochet'),
  ('Cross-stitch', 'cross-stitch'),
  ('Embroidery', 'embroidery'),
  ('Film photography', 'film-photography'),
  ('Gardening', 'gardening'),
  ('Guitar', 'guitar'),
  ('Pottery', 'pottery'),
  ('Resin art', 'resin-art'),
  ('Watercolor', 'watercolor'),
  ('Woodworking', 'woodworking')
on conflict (slug) do nothing;
