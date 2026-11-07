import { newPasswordSchema } from "@/shared/contracts/auth";
import { setPassword } from "@/server/auth/actions";
import { requireUser } from "@/server/auth/session";
import { parseBody } from "@/server/http/parse";
import { handleRoute, ok } from "@/server/http/respond";

// POST /api/auth/password. Sets a new password for the signed-in user.
export const POST = handleRoute(async (request) => {
  const user = await requireUser(request);
  const { password } = await parseBody(request, newPasswordSchema);
  await setPassword(user, password);
  return ok({ updated: true });
});
