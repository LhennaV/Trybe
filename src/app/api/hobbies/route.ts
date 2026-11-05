import { connection } from "next/server";
import { listHobbies } from "@/server/hobbies/list";
import { handleRoute, ok } from "@/server/http/respond";

// GET /api/hobbies. Public. Read at request time, never prerendered, so the
// build doesn't need a database.
export const GET = handleRoute(async () => {
  await connection();
  return ok(await listHobbies());
});
