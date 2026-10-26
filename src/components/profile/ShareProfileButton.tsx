"use client";

import { Export } from "@phosphor-icons/react";
import IconButton from "@/components/ui/IconButton";

// Uses the phone's share sheet when there is one, otherwise copies the link.
export default function ShareProfileButton({ handle }: { handle: string }) {
  async function share() {
    const url = `${window.location.origin}/users/${handle}`;
    try {
      if (navigator.share) await navigator.share({ title: `@${handle} on Trybe`, url });
      else await navigator.clipboard.writeText(url);
    } catch {
      // The person closed the share sheet, or the clipboard is blocked. Nothing to do.
    }
  }

  return (
    <IconButton label="Share profile" className="ml-auto" onClick={share}>
      <Export size={20} weight="bold" aria-hidden />
    </IconButton>
  );
}
