"use client";

import { useSearchParams } from "next/navigation";
import LoginForm from "./LoginForm";

// Reads ?error=link_invalid (set by GET /api/auth/confirm when an email link
// expired, AUTH_REDIRECTS.invalidLink) in the browser, so /login itself can
// still be prerendered. The page wraps this in <Suspense>.
export default function LoginFormFromLink() {
  const linkInvalid = useSearchParams().get("error") === "link_invalid";
  return <LoginForm linkInvalid={linkInvalid} />;
}
