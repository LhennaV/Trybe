"use client";

import { useId, useState } from "react";
import { Trash, Warning } from "@phosphor-icons/react";
import Button from "@/components/ui/Button";

const CONFIRM_WORD = "DELETE";

// In-app account deletion (DEL-01). The server cancels active trades, frees
// reserved items, and deletes the data (DEL-03). This is a real delete, not a
// deactivation, so the confirmation is deliberately slow.
export default function DeleteAccountForm() {
  const [typed, setTyped] = useState("");
  const [notice, setNotice] = useState("");
  const inputId = useId();

  return (
    <form
      className="flex flex-col gap-3.5"
      onSubmit={(event) => {
        event.preventDefault();
        setNotice("Account deletion isn't connected yet. It goes live with the accounts API.");
      }}
    >
      <div className="flex flex-col gap-2 rounded-card border-[1.5px] border-status-danger bg-surface-white p-3.5">
        <p className="flex items-center gap-2 text-body-m font-bold text-status-danger">
          <Warning size={18} weight="bold" aria-hidden />
          This can&apos;t be undone
        </p>
        <ul className="flex list-disc flex-col gap-1 pl-5 text-body-s text-ink-900">
          <li>Your profile, posts, photos, gear, and messages are deleted.</li>
          <li>Any trades still in progress are cancelled, and the other person is told.</li>
          <li>Gear reserved in a trade goes back to the other person&apos;s list.</li>
        </ul>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={inputId} className="text-label-s text-ink-600">
          Type {CONFIRM_WORD} to confirm
        </label>
        <input
          id={inputId}
          value={typed}
          onChange={(event) => setTyped(event.target.value)}
          autoComplete="off"
          autoCapitalize="characters"
          className="h-13 rounded-input border-[1.5px] border-line bg-surface-white px-4 text-body-m text-ink-900"
        />
      </div>

      {notice && (
        <p role="status" className="rounded-xl bg-brand-lavender-soft px-3.5 py-3 text-body-s text-brand-plum-dark">
          {notice}
        </p>
      )}

      <Button type="submit" variant="danger" fullWidth disabled={typed.trim() !== CONFIRM_WORD}>
        <Trash size={18} weight="bold" aria-hidden />
        Delete my account
      </Button>
    </form>
  );
}
