-- Starting categories for each hobby (approved by Tristan 2026-11-13).
-- Every hobby ends with "Other". Safe to run twice. To change the list later,
-- write a new migration; never edit this one after it is applied. Items point
-- at a category by id, so renaming a category never breaks them.

insert into public.categories (hobby_id, name, slug, position)
select h.id, c.name, c.slug, c.position
from (
  values
    ('baking', 'Pans & molds', 'pans-molds', 1),
    ('baking', 'Mixers & appliances', 'mixers-appliances', 2),
    ('baking', 'Tools & utensils', 'tools-utensils', 3),
    ('baking', 'Decorating', 'decorating', 4),

    ('bookbinding', 'Paper & board', 'paper-board', 1),
    ('bookbinding', 'Tools', 'tools', 2),
    ('bookbinding', 'Thread & glue', 'thread-glue', 3),
    ('bookbinding', 'Presses', 'presses', 4),

    ('bouldering', 'Shoes', 'shoes', 1),
    ('bouldering', 'Chalk & bags', 'chalk-bags', 2),
    ('bouldering', 'Crash pads', 'crash-pads', 3),
    ('bouldering', 'Training gear', 'training-gear', 4),

    ('calligraphy', 'Pens & nibs', 'pens-nibs', 1),
    ('calligraphy', 'Ink', 'ink', 2),
    ('calligraphy', 'Paper', 'paper', 3),
    ('calligraphy', 'Guides & books', 'guides-books', 4),

    ('candle-making', 'Wax', 'wax', 1),
    ('candle-making', 'Wicks', 'wicks', 2),
    ('candle-making', 'Molds & jars', 'molds-jars', 3),
    ('candle-making', 'Scents & dyes', 'scents-dyes', 4),

    ('crochet', 'Hooks', 'hooks', 1),
    ('crochet', 'Yarn', 'yarn', 2),
    ('crochet', 'Patterns & books', 'patterns-books', 3),
    ('crochet', 'Notions', 'notions', 4),

    ('cross-stitch', 'Fabric', 'fabric', 1),
    ('cross-stitch', 'Floss', 'floss', 2),
    ('cross-stitch', 'Hoops & frames', 'hoops-frames', 3),
    ('cross-stitch', 'Patterns & kits', 'patterns-kits', 4),

    ('embroidery', 'Floss & thread', 'floss-thread', 1),
    ('embroidery', 'Hoops', 'hoops', 2),
    ('embroidery', 'Needles & tools', 'needles-tools', 3),
    ('embroidery', 'Patterns & kits', 'patterns-kits', 4),

    ('film-photography', 'Cameras', 'cameras', 1),
    ('film-photography', 'Lenses', 'lenses', 2),
    ('film-photography', 'Film', 'film', 3),
    ('film-photography', 'Darkroom gear', 'darkroom-gear', 4),

    ('gardening', 'Hand tools', 'hand-tools', 1),
    ('gardening', 'Pots & planters', 'pots-planters', 2),
    ('gardening', 'Seeds & plants', 'seeds-plants', 3),
    ('gardening', 'Soil & care', 'soil-care', 4),

    ('guitar', 'Guitars', 'guitars', 1),
    ('guitar', 'Amps & pedals', 'amps-pedals', 2),
    ('guitar', 'Accessories', 'accessories', 3),
    ('guitar', 'Books & lessons', 'books-lessons', 4),

    ('pottery', 'Wheels & kilns', 'wheels-kilns', 1),
    ('pottery', 'Hand tools', 'hand-tools', 2),
    ('pottery', 'Clay & glaze', 'clay-glaze', 3),

    ('resin-art', 'Resin & hardener', 'resin-hardener', 1),
    ('resin-art', 'Molds', 'molds', 2),
    ('resin-art', 'Pigments & inclusions', 'pigments-inclusions', 3),
    ('resin-art', 'Safety gear', 'safety-gear', 4),

    ('watercolor', 'Paints', 'paints', 1),
    ('watercolor', 'Brushes', 'brushes', 2),
    ('watercolor', 'Paper & pads', 'paper-pads', 3),
    ('watercolor', 'Palettes & tools', 'palettes-tools', 4),

    ('woodworking', 'Hand tools', 'hand-tools', 1),
    ('woodworking', 'Power tools', 'power-tools', 2),
    ('woodworking', 'Wood & lumber', 'wood-lumber', 3),
    ('woodworking', 'Clamps & jigs', 'clamps-jigs', 4)
) as c (hobby_slug, name, slug, position)
join public.hobbies h on h.slug = c.hobby_slug
on conflict (hobby_id, slug) do nothing;
--> statement-breakpoint
-- "Other" for every hobby, always last (position 99 leaves room to add more).
insert into public.categories (hobby_id, name, slug, position)
select h.id, 'Other', 'other', 99
from public.hobbies h
on conflict (hobby_id, slug) do nothing;
