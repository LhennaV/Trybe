import { PHOTO_FIELD } from "@/shared/contracts/photos";
import type { Me, UpdateMe } from "@/shared/contracts/users";
import { PhotoTooBigError, PhotoUnreadableError, resizeForUpload } from "@/shared/images/resizeForUpload";
import { apiRequest } from "@/components/api/request";

// Your own profile (TRD section 8.2). Plain functions so screens stay thin.

export function getMe() {
  return apiRequest<Me>("/api/me");
}

// PATCH /api/me (PROF-06). Send only the fields that changed.
export function updateMe(input: UpdateMe) {
  return apiRequest<Me>("/api/me", { method: "PATCH", body: input });
}

// Shrinks a picked photo before it's cropped and uploaded (PROF-06). Vercel
// takes 4.5 MB at most and the server can't read iPhone HEIC; this turns any
// photo into a small, upright JPEG.
export async function shrinkPhoto(file: File): Promise<{ ok: true; blob: Blob } | { ok: false; message: string }> {
  try {
    return { ok: true, blob: await resizeForUpload(file) };
  } catch (error) {
    // Both errors already carry a message written for people.
    if (error instanceof PhotoTooBigError || error instanceof PhotoUnreadableError) {
      return { ok: false, message: error.message };
    }
    throw error;
  }
}

// POST /api/me/photo. `photo` is already shrunk and cropped. Returns the
// updated profile with the new photoUrl.
export function uploadProfilePhoto(photo: Blob) {
  const form = new FormData();
  form.append(PHOTO_FIELD, photo, "photo.jpg");
  return apiRequest<Me>("/api/me/photo", { body: form });
}

export function removeProfilePhoto() {
  return apiRequest<Me>("/api/me/photo", { method: "DELETE" });
}
