import "server-only";
import { createAdminClient } from "@/server/auth/supabase";

// Photo storage in Supabase Storage (TRD section 13). One public bucket,
// created by migration 0006: anyone can view a photo by its URL, only the
// server can write (no storage policies for browsers).
//
// URLs are never stored half-built or hard-coded: they always come from
// NEXT_PUBLIC_SUPABASE_URL, so moving projects only means changing that value.

export const PHOTO_BUCKET = "photos";
const PUBLIC_PREFIX = `/storage/v1/object/public/${PHOTO_BUCKET}/`;

export function publicPhotoUrl(path: string) {
  return new URL(`${PUBLIC_PREFIX}${path}`, process.env.NEXT_PUBLIC_SUPABASE_URL).toString();
}

// The storage path inside a URL made by publicPhotoUrl(), or null if the URL
// isn't one of our photos (for example a photo from before this existed).
export function photoPathFromUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    const base = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "");
    if (parsed.host !== base.host || !parsed.pathname.startsWith(PUBLIC_PREFIX)) return null;
    return decodeURIComponent(parsed.pathname.slice(PUBLIC_PREFIX.length));
  } catch {
    return null;
  }
}

export async function uploadPhoto(path: string, data: Buffer) {
  const { error } = await createAdminClient()
    .storage.from(PHOTO_BUCKET)
    .upload(path, data, { contentType: "image/webp", cacheControl: "31536000", upsert: false });
  if (error) throw error;
  return publicPhotoUrl(path);
}

// Best effort: a leftover file is harmless (the orphan cleanup job in
// docs/database.md section 8 removes it later), so this never throws.
export async function deletePhotos(paths: string[]) {
  if (paths.length === 0) return;
  try {
    await createAdminClient().storage.from(PHOTO_BUCKET).remove(paths);
  } catch (error) {
    console.error("Couldn't delete photos", paths, error);
  }
}
