"use client";

import { useSearchParams } from "next/navigation";
import LoginForm from "./LoginForm";

// Reads the query in the browser, so /login itself can still be prerendered.
// The page wraps this in <Suspense>.
// - ?error=link_invalid: set by GET /api/auth/confirm when an email link
//   expired (AUTH_REDIRECTS.invalidLink).
// - ?next=/settings: set by src/proxy.ts, the page to go back to after login.
export default function LoginFormFromLink() {
  const params = useSearchParams();
  return <LoginForm linkInvalid={params.get("error") === "link_invalid"} next={params.get("next")} />;
}
