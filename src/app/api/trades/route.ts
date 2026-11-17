import { connection } from "next/server";
import { proposeTradeSchema, tradesQuerySchema } from "@/shared/contracts/trades";
import { requireUser } from "@/server/auth/session";
import { parseBody, parseQuery } from "@/server/http/parse";
import { handleRoute, ok } from "@/server/http/respond";
import { getTrade, listTrades } from "@/server/trades/read";
import { proposeTrade } from "@/server/trades/write";
import { requireActiveUser } from "@/server/users/guards";

// GET /api/trades?status=&cursor=&limit=. The signed-in person's trades,
// most recently changed first.
export const GET = handleRoute(async (request) => {
  await connection();
  const user = await requireUser(request);
  return ok(await listTrades(user.id, parseQuery(request, tradesQuerySchema)));
});

// POST /api/trades (TRD-01, TRD-02, TRD-09). The other person is the owner of
// wantItemIds. Returns the new trade.
export const POST = handleRoute(async (request) => {
  const user = await requireActiveUser(request);
  const input = await parseBody(request, proposeTradeSchema);
  const tradeId = await proposeTrade(user, input);
  return ok(await getTrade(user.id, tradeId), 201);
});
