"use client";

import type { ReactNode } from "react";
import { useMe } from "@/components/profile/useMe";

// Shows `signedIn` or `signedOut` on public screens (Feed, Explore) that
// logged-out people can browse. Shows neither while /api/me is loading or
// failed, so nobody sees a flash of the wrong one.
export default function AuthSwitch({ signedIn = null, signedOut = null }: { signedIn?: ReactNode; signedOut?: ReactNode }) {
  const { status } = useMe();
  if (status === "ready") return signedIn;
  if (status === "signed-out") return signedOut;
  return null;
}
