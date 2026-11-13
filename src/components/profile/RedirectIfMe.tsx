"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useMe } from "./useMe";

// On your own public profile, go to /profile instead, which has Edit profile
// rather than Message.
export default function RedirectIfMe({ handle }: { handle: string }) {
  const router = useRouter();
  const state = useMe();
  const mine = state.status === "ready" && state.me.handle === handle;

  useEffect(() => {
    if (mine) router.replace("/profile");
  }, [mine, router]);

  return null;
}
