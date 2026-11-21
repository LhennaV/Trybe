import { tokenLogInSchema } from "@/shared/contracts/auth";
import { logInForToken } from "@/server/auth/actions";
import { parseBody } from "@/server/http/parse";
import { handleRoute, ok } from "@/server/http/respond";

// POST /api/auth/token. Log in for the mobile app: returns the session
// (access and refresh tokens) instead of setting cookies. The website keeps
// using POST /api/auth/login.
export const POST = handleRoute(async (request) => {
  const input = await parseBody(request, tokenLogInSchema);
  return ok(await logInForToken(input));
});
