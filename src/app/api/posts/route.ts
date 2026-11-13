import { createPostSchema } from "@/shared/contracts/posts";
import { parseBody } from "@/server/http/parse";
import { handleRoute, ok } from "@/server/http/respond";
import { createPost } from "@/server/posts/write";
import { requireActiveUser } from "@/server/users/guards";

// POST /api/posts (POST-01). Upload the photos first with POST /api/photos.
export const POST = handleRoute(async (request) => {
  const user = await requireActiveUser(request);
  const input = await parseBody(request, createPostSchema);
  return ok(await createPost(user, input), 201);
});
