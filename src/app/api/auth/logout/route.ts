import { logOut } from "@/server/auth/actions";
import { handleRoute, ok } from "@/server/http/respond";

// POST /api/auth/logout. Clears the session cookies on this device.
export const POST = handleRoute(async () => {
  await logOut();
  return ok({ loggedOut: true });
});
