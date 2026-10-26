import { connection } from "next/server";
import { checkHealth } from "@/server/health";
import { handleRoute, ok } from "@/server/http/respond";

// GET /api/health. Checks the database on every request, never prerendered.
export const GET = handleRoute(async () => {
  await connection();
  return ok(await checkHealth());
});
