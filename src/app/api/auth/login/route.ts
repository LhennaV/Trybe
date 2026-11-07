import { logInSchema } from "@/shared/contracts/auth";
import { logIn } from "@/server/auth/actions";
import { parseBody } from "@/server/http/parse";
import { handleRoute, ok } from "@/server/http/respond";

// POST /api/auth/login. Sets the session cookies.
export const POST = handleRoute(async (request) => {
  const input = await parseBody(request, logInSchema);
  return ok(await logIn(input));
});
