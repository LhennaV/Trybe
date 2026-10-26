export type PickedPhoto = {
  id: string;
  file: File;
  // Object URL for previews. Revoke it when the photo is removed.
  url: string;
};

// From TRD section 13. The upload size is still marked "Proposed".
export const MAX_POST_PHOTOS = 6;
export const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
export const ACCEPTED_PHOTO_TYPES = "image/jpeg,image/png,image/webp,image/heic";

// Turns picked files into previews, skipping files that are too big and
// anything past the photo limit. Returns a message about skipped files.
export function addPhotos(
  current: PickedPhoto[],
  files: FileList | null,
): { photos: PickedPhoto[]; error: string } {
  if (!files) return { photos: current, error: "" };

  const room = MAX_POST_PHOTOS - current.length;
  const all = Array.from(files);
  const fitting = all.filter((file) => file.size <= MAX_PHOTO_BYTES);
  const added = fitting.slice(0, Math.max(room, 0)).map((file) => ({
    id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
    file,
    url: URL.createObjectURL(file),
  }));

  let error = "";
  if (fitting.length < all.length) error = "Some photos are over 10 MB, so we skipped them.";
  else if (fitting.length > room) error = `You can add up to ${MAX_POST_PHOTOS} photos.`;

  return { photos: [...current, ...added], error };
}
