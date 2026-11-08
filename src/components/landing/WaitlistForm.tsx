"use client";

import { EnvelopeSimple } from "@phosphor-icons/react";
import { useId, useState } from "react";
import Button from "@/components/ui/Button";

type WaitlistFormProps = {
  id?: string;
  className?: string;
  // On a plum card, a plum button and focus ring would disappear into the background.
  onPlum?: boolean;
};

export default function WaitlistForm({ id, className, onPlum = false }: WaitlistFormProps) {
  const inputId = useId();
  const [notice, setNotice] = useState("");

  return (
    <form
      id={id}
      className={["flex w-full flex-col gap-2.5", className].filter(Boolean).join(" ")}
      onSubmit={(event) => {
        event.preventDefault();
        setNotice("The beta list isn't open yet. It goes live once the waitlist API is ready.");
      }}
    >
      {/* Phones: email on top, full-width button under it. Side by side from sm up. */}
      <div className="flex flex-col gap-2.5 sm:flex-row">
        <label htmlFor={inputId} className="sr-only">
          Your email
        </label>
        {/* The ring sits on the wrapper so it surrounds the icon too. */}
        <div
          className={`flex h-13 min-w-0 items-center sm:flex-1 gap-2.5 rounded-input border-[1.5px] border-line bg-surface-white px-4 focus-within:outline-2 focus-within:outline-offset-2 ${
            onPlum ? "focus-within:outline-surface-white" : "focus-within:outline-brand-plum"
          }`}
        >
          <EnvelopeSimple size={20} weight="bold" className="shrink-0 text-ink-400" aria-hidden />
          <input
            id={inputId}
            name="email"
            type="email"
            placeholder="Your email"
            autoComplete="email"
            required
            className="h-full min-w-0 flex-1 bg-transparent text-body-m text-ink-900 outline-none! placeholder:text-ink-400"
          />
        </div>
        <Button
          type="submit"
          variant={onPlum ? "secondary" : "primary"}
          className={[
            "w-full shrink-0 sm:w-auto",
            onPlum ? "focus-visible:outline-surface-white!" : "",
          ].join(" ")}
        >
          Join the beta
        </Button>
      </div>
      {notice && (
        <p role="status" className="rounded-xl bg-brand-lavender-soft px-3.5 py-3 text-body-s text-brand-plum-dark">
          {notice}
        </p>
      )}
    </form>
  );
}
