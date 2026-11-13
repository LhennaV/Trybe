"use client";

import { useEffect, useId, useState } from "react";
import { Trash, Warning } from "@phosphor-icons/react";
import { useMe } from "@/components/profile/useMe";
import Button from "@/components/ui/Button";
import Sheet from "@/components/ui/Sheet";

const CONFIRM_WORD = "DELETE";
// The final button stays locked this long, so a fast double tap can't delete.
const FINAL_WAIT_SECONDS = 3;

// In-app account deletion (DEL-01). The server cancels active trades, frees
// reserved items, and deletes the data (DEL-03). This is a real delete, not a
// deactivation, so it takes two confirmations: typing DELETE, then a last
// check in a sheet that names the account.
export default function DeleteAccountForm() {
  const state = useMe();
  const me = state.status === "ready" ? state.me : null;
  const [typed, setTyped] = useState("");
  const [finalOpen, setFinalOpen] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(FINAL_WAIT_SECONDS);
  const [notice, setNotice] = useState("");
  const inputId = useId();
  const typedOk = typed.trim() === CONFIRM_WORD;

  useEffect(() => {
    if (!finalOpen || secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [finalOpen, secondsLeft]);

  function openFinal() {
    setSecondsLeft(FINAL_WAIT_SECONDS);
    setFinalOpen(true);
  }

  function deleteForGood() {
    setFinalOpen(false);
    // DELETE /api/me doesn't exist yet (Phase 5, DEL-01 and DEL-03).
    setNotice("Account deletion isn't connected yet. It goes live with the accounts API.");
  }

  return (
    <form
      className="flex flex-col gap-3.5"
      onSubmit={(event) => {
        event.preventDefault();
        if (typedOk) openFinal();
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
          spellCheck={false}
          className="h-13 rounded-input border-[1.5px] border-line bg-surface-white px-4 text-body-m text-ink-900"
        />
      </div>

      {notice && (
        <p role="status" className="rounded-xl bg-brand-lavender-soft px-3.5 py-3 text-body-s text-brand-plum-dark">
          {notice}
        </p>
      )}

      <Button type="submit" variant="danger" fullWidth disabled={!typedOk}>
        <Trash size={18} weight="bold" aria-hidden />
        Delete my account
      </Button>

      <Sheet open={finalOpen} onClose={() => setFinalOpen(false)} label="Delete your account for good?">
        <div className="flex flex-col gap-5 pt-2">
          <div className="flex flex-col gap-1.5">
            <h2 className="font-display text-display-m text-ink-900">
              {me ? `Delete @${me.handle} for good?` : "Delete your account for good?"}
            </h2>
            <p className="text-body-s text-ink-600">
              Last check. {me ? <strong className="font-bold text-ink-900">{me.email}</strong> : "Your account"} and
              everything on it will be gone, and you can&apos;t get it back.
            </p>
          </div>
          <div className="flex flex-col gap-2.5">
            {/* The safe choice comes first, so it gets focus when the sheet opens. */}
            <Button fullWidth onClick={() => setFinalOpen(false)}>
              Keep my account
            </Button>
            <Button fullWidth variant="danger" disabled={secondsLeft > 0} onClick={deleteForGood}>
              <Trash size={18} weight="bold" aria-hidden />
              {secondsLeft > 0 ? `Yes, delete forever (${secondsLeft})` : "Yes, delete forever"}
            </Button>
          </div>
        </div>
      </Sheet>
    </form>
  );
}
