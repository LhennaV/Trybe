"use client";

import { useState } from "react";
import { MESSAGE_PERMISSIONS, type MessagePermission } from "@/shared/contracts/users";
import { setMe, useMe } from "@/components/profile/useMe";
import ChoiceList from "@/components/ui/ChoiceList";
import Skeleton from "@/components/ui/Skeleton";
import { MESSAGE_PERMISSION_COPY } from "./messagePermissions";
import { updateMe } from "./profileApi";

const OPTIONS = MESSAGE_PERMISSIONS.map((value) => ({ value, ...MESSAGE_PERMISSION_COPY[value] }));

// Who can message me (CHAT-06). Saves as soon as you pick, through PATCH /api/me.
export default function MessagePermissionSettings() {
  const state = useMe();
  // The choice being saved, shown right away so the tap feels instant.
  const [pending, setPending] = useState<MessagePermission | null>(null);
  const [error, setError] = useState("");

  if (state.status === "loading" || state.status === "signed-out") {
    return (
      <div role="status" aria-label="Loading your message settings" className="flex flex-col gap-2.5">
        <Skeleton className="h-[68px] rounded-card" />
        <Skeleton className="h-[68px] rounded-card" />
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <p role="alert" className="text-body-s text-status-danger">
        {state.message}
      </p>
    );
  }

  const value = pending ?? state.me.messagePermission;

  async function choose(next: MessagePermission) {
    if (next === value || pending) return;
    setPending(next);
    setError("");
    const result = await updateMe({ messagePermission: next });
    if (result.ok) setMe(result.data);
    else setError(result.message);
    setPending(null);
  }

  return (
    <div className="flex flex-col gap-3">
      <ChoiceList label="Who can message me" options={OPTIONS} value={value} onChange={choose} look="list" />
      {error ? (
        <p role="alert" className="text-body-s text-status-danger">
          {error}
        </p>
      ) : (
        <p aria-live="polite" className="text-caption text-ink-600">
          {pending ? "Saving…" : "People you've blocked can never message you, whatever you pick here."}
        </p>
      )}
    </div>
  );
}
