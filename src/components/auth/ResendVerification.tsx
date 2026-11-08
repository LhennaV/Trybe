"use client";

import { useEffect, useState } from "react";
import { resendVerification } from "./authApi";

const COOLDOWN_SECONDS = 60;

// "Send it again" for the verification email (AUTH-05). After sending, it
// counts down so people don't tap it ten times and hit the rate limit.
export default function ResendVerification({ email, startCoolingDown = false }: { email: string; startCoolingDown?: boolean }) {
  const [secondsLeft, setSecondsLeft] = useState(startCoolingDown ? COOLDOWN_SECONDS : 0);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  async function resend() {
    setSending(true);
    setMessage("");
    const result = await resendVerification({ email });
    setSending(false);
    if (result.ok) {
      setMessage("Sent a new link! Use the newest email.");
      setSecondsLeft(COOLDOWN_SECONDS);
    } else {
      setMessage(result.message);
    }
  }

  const waiting = secondsLeft > 0;

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={resend}
        disabled={sending || waiting}
        className="flex min-h-11 items-center font-bold text-brand-plum disabled:text-ink-600"
      >
        {sending ? "Sending…" : waiting ? `Send again in ${secondsLeft}s` : "Send the link again"}
      </button>
      {message && (
        <p role="status" className="font-bold">
          {message}
        </p>
      )}
    </div>
  );
}
