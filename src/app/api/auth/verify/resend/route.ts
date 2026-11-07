import { emailRequestSchema } from "@/shared/contracts/auth";
import { resendVerification } from "@/server/auth/actions";
import { parseBody } from "@/server/http/parse";
import { handleRoute, ok } from "@/server/http/respond";

// POST /api/auth/verify/resend. Sends the verification email again.
export const POST = handleRoute(async (request) => {
  const input = await parseBody(request, emailRequestSchema);
  await resendVerification(input);
  return ok({ sent: true });
});
