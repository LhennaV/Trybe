-- Supabase Storage bucket for every photo (TRD section 13, docs/database.md).
--
-- Public: anyone can view a photo by its URL, like the posts it belongs to.
-- No storage policies for anon or authenticated users, so browsers can't
-- upload, change, or delete files. Only the server (service role) writes,
-- after src/server/uploads/image.ts has checked and re-encoded the image.
--
-- The server only ever writes WebP. The limit matches the largest output with
-- room to spare; the upload limit for people is enforced by the API (4 MB).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('photos', 'photos', true, 5242880, array['image/webp'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;
