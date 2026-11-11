import { PHOTO_FIELD } from "@/shared/contracts/photos";
import { requireUser } from "@/server/auth/session";
import { AppError } from "@/server/errors";
import { handleRoute, ok } from "@/server/http/respond";
import { removeProfilePhoto, setProfilePhoto } from "@/server/users/photo";

// POST /api/me/photo. Multipart form with the photo in the `photo` field,
// already shrunk in the browser with resizeForUpload(). Returns /api/me.
export const POST = handleRoute(async (request) => {
  const user = await requireUser(request);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    throw new AppError("VALIDATION_FAILED", "Send the photo as a multipart form.");
  }

  return ok(await setProfilePhoto(user, form.get(PHOTO_FIELD)));
});

// DELETE /api/me/photo. Removes the profile photo. Returns /api/me.
export const DELETE = handleRoute(async (request) => {
  const user = await requireUser(request);
  return ok(await removeProfilePhoto(user));
});
