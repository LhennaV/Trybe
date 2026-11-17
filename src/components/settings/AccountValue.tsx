"use client";

import { useMe } from "@/components/profile/useMe";
import { maskEmail } from "./maskEmail";
import { MESSAGE_PERMISSION_COPY } from "./messagePermissions";

// A value on a Settings row that comes from your account (GET /api/me).
// Shows nothing until it loads, so the row never flashes a wrong value.
export default function AccountValue({ field }: { field: "email" | "messagePermission" }) {
  const state = useMe();
  if (state.status !== "ready") return null;
  if (field === "email") return <>{maskEmail(state.me.email)}</>;
  return <>{MESSAGE_PERMISSION_COPY[state.me.messagePermission].short}</>;
}
