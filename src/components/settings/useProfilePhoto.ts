"use client";

import { useEffect, useState } from "react";
import type { Me } from "@/shared/contracts/users";
import { removeProfilePhoto, uploadProfilePhoto } from "./profileApi";

// A photo change waits here until Save: a new cropped photo, or removing the
// current one. Leaving Edit profile without saving throws it away.
type Draft = { kind: "none" } | { kind: "new"; blob: Blob; previewUrl: string } | { kind: "remove" };

export type ProfilePhoto = ReturnType<typeof useProfilePhoto>;

// `savedUrl` is the photo from GET /api/me. save() returns the updated
// profile, or null with `error` set.
export function useProfilePhoto(savedUrl: string | null) {
  const [draft, setDraft] = useState<Draft>({ kind: "none" });
  const [error, setError] = useState("");

  // Free the preview when it's replaced or the screen closes.
  useEffect(() => {
    if (draft.kind !== "new") return;
    return () => URL.revokeObjectURL(draft.previewUrl);
  }, [draft]);

  // What the avatar shows right now, saved or not.
  const shownUrl = draft.kind === "new" ? draft.previewUrl : draft.kind === "remove" ? null : savedUrl;

  function choose(blob: Blob) {
    setError("");
    setDraft({ kind: "new", blob, previewUrl: URL.createObjectURL(blob) });
  }

  function remove() {
    setError("");
    setDraft(savedUrl ? { kind: "remove" } : { kind: "none" });
  }

  async function save(): Promise<Me | null> {
    if (draft.kind === "none") return null;
    const result = draft.kind === "new" ? await uploadProfilePhoto(draft.blob) : await removeProfilePhoto();
    if (!result.ok) {
      setError(result.fields.photo?.[0] ?? result.message);
      return null;
    }
    setDraft({ kind: "none" });
    return result.data;
  }

  return { shownUrl, dirty: draft.kind !== "none", error, setError, choose, remove, save };
}
