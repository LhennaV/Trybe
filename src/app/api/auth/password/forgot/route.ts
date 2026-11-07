import { emailRequestSchema } from "@/shared/contracts/auth";
import { sendPasswordReset } from "@/server/auth/actions";
import { parseBody } from "@/server/http/parse";
import { handleRoute, ok } from "@/server/http/respond";

// POST /api/auth/password/forgot. Emails a reset link if the account exists.
export const POST = handleRoute(async (request) => {
  const input = await parseBody(request, emailRequestSchema);
  await sendPasswordReset(input);
  return ok({ sent: true });
});
