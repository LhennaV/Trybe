import { signUpSchema } from "@/shared/contracts/auth";
import { signUp } from "@/server/auth/actions";
import { parseBody } from "@/server/http/parse";
import { handleRoute, ok } from "@/server/http/respond";

// POST /api/auth/signup. Creates the account and sends the verification email.
export const POST = handleRoute(async (request) => {
  const input = await parseBody(request, signUpSchema);
  return ok(await signUp(input), 201);
});
