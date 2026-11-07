import { connection } from "next/server";
import { updateMeSchema } from "@/shared/contracts/users";
import { requireUser } from "@/server/auth/session";
import { parseBody } from "@/server/http/parse";
import { handleRoute, ok } from "@/server/http/respond";
import { getMe } from "@/server/users/profile";
import { updateMe } from "@/server/users/update";

// GET /api/me. The signed-in user's own profile.
export const GET = handleRoute(async (request) => {
  await connection();
  const user = await requireUser(request);
  return ok(await getMe(user));
});

// PATCH /api/me. Partial update; unknown fields are rejected.
export const PATCH = handleRoute(async (request) => {
  const user = await requireUser(request);
  const input = await parseBody(request, updateMeSchema);
  return ok(await updateMe(user, input));
});
