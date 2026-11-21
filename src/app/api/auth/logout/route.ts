import { bearerToken } from "@/server/auth/session";
import { logOut } from "@/server/auth/actions";
import { handleRoute, ok } from "@/server/http/respond";

// POST /api/auth/logout. Ends the session on this device: the app's Bearer
// token, or the website's cookies.
export const POST = handleRoute(async (request) => {
  await logOut(bearerToken(request));
  return ok({ loggedOut: true });
});
