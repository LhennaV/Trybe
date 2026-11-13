import { connection } from "next/server";
import { categoriesQuerySchema } from "@/shared/contracts/items";
import { listCategories } from "@/server/categories/list";
import { parseQuery } from "@/server/http/parse";
import { handleRoute, ok } from "@/server/http/respond";

// GET /api/categories?hobby=pottery. Public. Without `hobby`, every category.
export const GET = handleRoute(async (request) => {
  await connection();
  const { hobby } = parseQuery(request, categoriesQuerySchema);
  return ok(await listCategories(hobby));
});
