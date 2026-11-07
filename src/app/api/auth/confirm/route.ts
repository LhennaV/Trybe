import { redirect } from "next/navigation";
import { connection } from "next/server";
import { confirmEmailLink } from "@/server/auth/actions";
import { handleRoute } from "@/server/http/respond";

// GET /api/auth/confirm?token_hash=...&type=... The link in Supabase emails
// (verification and password reset) points here. Signs the person in, then
// sends them to a page.
export const GET = handleRoute(async (request) => {
  await connection();
  const params = new URL(request.url).searchParams;
  const destination = await confirmEmailLink(params.get("token_hash"), params.get("type"));
  redirect(destination);
});
