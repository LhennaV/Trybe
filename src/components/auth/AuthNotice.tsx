import type { ReactNode } from "react";
import { CheckCircle, WarningCircle } from "@phosphor-icons/react/dist/ssr";

type Tone = "info" | "success" | "error";

// Messages on the account screens.
// - error: one quiet line in red above the button, no box (role="alert").
// - info / success: the lavender or mint note card used across the app.
export default function AuthNotice({ tone = "info", children }: { tone?: Tone; children: ReactNode }) {
  if (tone === "error") {
    return (
      <div role="alert" className="flex items-start gap-2 text-body-s text-status-danger">
        <WarningCircle size={18} weight="bold" aria-hidden className="mt-px shrink-0" />
        <div className="flex min-w-0 flex-col gap-1">{children}</div>
      </div>
    );
  }

  return (
    <div
      role="status"
      className={[
        "flex items-start gap-2.5 rounded-input px-3.5 py-3 text-body-s",
        tone === "success" ? "bg-status-success-soft text-ink-900" : "bg-brand-lavender-soft text-ink-900",
      ].join(" ")}
    >
      {tone === "success" && (
        <CheckCircle size={18} weight="fill" aria-hidden className="mt-px shrink-0 text-status-success" />
      )}
      <div className="flex min-w-0 flex-col gap-1">{children}</div>
    </div>
  );
}
