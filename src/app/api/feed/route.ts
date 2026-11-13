import { connection } from "next/server";
import { feedQuerySchema } from "@/shared/contracts/posts";
import { getSessionUser } from "@/server/auth/session";
import { parseQuery } from "@/server/http/parse";
import { handleRoute, ok } from "@/server/http/respond";
import { listFeed } from "@/server/posts/read";

// GET /api/feed?hobby=pottery&cursor=&limit= (POST-05). Public; when signed
// in, cards also say whether you liked or saved each post.
export const GET = handleRoute(async (request) => {
  await connection();
  const query = parseQuery(request, feedQuerySchema);
  const viewer = await getSessionUser(request);
  return ok(await listFeed(query, viewer?.id ?? null));
});
