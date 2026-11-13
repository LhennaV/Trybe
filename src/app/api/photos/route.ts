import { PHOTO_FIELD } from "@/shared/contracts/photos";
import { AppError } from "@/server/errors";
import { handleRoute, ok } from "@/server/http/respond";
import { uploadContentPhoto } from "@/server/photos/photos";
import { requireActiveUser } from "@/server/users/guards";

// POST /api/photos. A photo for an item or a post: multipart form with the
// photo in the `photo` field, already shrunk with resizeForUpload(). Returns
// the photo with its id, to send as photoIds when creating the item or post.
export const POST = handleRoute(async (request) => {
  const user = await requireActiveUser(request);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    throw new AppError("VALIDATION_FAILED", "Send the photo as a multipart form.");
  }

  return ok(await uploadContentPhoto(user, form.get(PHOTO_FIELD)), 201);
});
