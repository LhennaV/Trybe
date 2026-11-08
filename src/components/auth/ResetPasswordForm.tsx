"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PASSWORD_MIN, newPasswordSchema } from "@/shared/contracts/auth";
import { firstFieldErrors, zodFieldErrors } from "@/components/api/request";
import Button, { buttonClassName } from "@/components/ui/Button";
import PasswordInput from "@/components/ui/PasswordInput";
import AuthNotice from "./AuthNotice";
import { setNewPassword } from "./authApi";

// Opened from a reset email: GET /api/auth/confirm signed the person in and
// sent them here (AUTH_REDIRECTS.recovery). Sets the new password with
// POST /api/auth/password.
export default function ResetPasswordForm() {
  const router = useRouter();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [sessionMissing, setSessionMissing] = useState(false);
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(form: HTMLFormElement) {
    const data = new FormData(form);
    const password = data.get("password");
    const confirm = data.get("confirmPassword");

    const parsed = newPasswordSchema.safeParse({ password });
    if (!parsed.success) {
      setFieldErrors(zodFieldErrors(parsed.error));
      return;
    }
    if (password !== confirm) {
      setFieldErrors({ confirmPassword: "Those don't match. Type it once more." });
      return;
    }

    setFieldErrors({});
    setError("");
    setPending(true);
    const result = await setNewPassword(parsed.data);
    setPending(false);

    if (result.ok) {
      setDone(true);
      return;
    }
    if (result.code === "UNAUTHENTICATED") {
      // The reset session is gone (link not opened on this device, or expired).
      setSessionMissing(true);
      return;
    }
    setFieldErrors(firstFieldErrors(result.fields));
    setError(result.message);
  }

  if (done) {
    return (
      <div className="flex flex-1 flex-col gap-4 lg:flex-none">
        <AuthNotice tone="success">
          <p className="font-bold">Password updated!</p>
          <p>You&apos;re still logged in on this device. Use the new password next time.</p>
        </AuthNotice>
        <div className="flex-1 lg:hidden" />
        <Button
          fullWidth
          onClick={() => {
            router.replace("/feed");
            router.refresh();
          }}
        >
          Back to Trybe
        </Button>
      </div>
    );
  }

  if (sessionMissing) {
    return (
      <div className="flex flex-1 flex-col gap-4 lg:flex-none">
        <AuthNotice tone="error">
          <p className="font-bold">This reset link expired.</p>
          <p>Links work once and only for a short while. Grab a fresh one and open it on this device.</p>
        </AuthNotice>
        <div className="flex-1 lg:hidden" />
        <Link href="/forgot-password" className={buttonClassName({ fullWidth: true })}>
          Send a new link
        </Link>
      </div>
    );
  }

  return (
    <form
      noValidate
      className="flex flex-1 flex-col gap-4 lg:flex-none"
      onSubmit={(event) => {
        event.preventDefault();
        void handleSubmit(event.currentTarget);
      }}
    >
      <PasswordInput
        label="New password"
        name="password"
        placeholder={`At least ${PASSWORD_MIN} characters`}
        autoComplete="new-password"
        minLength={PASSWORD_MIN}
        required
        error={fieldErrors.password}
      />
      <PasswordInput
        label="Type it again"
        name="confirmPassword"
        placeholder="Same password"
        autoComplete="new-password"
        required
        error={fieldErrors.confirmPassword}
      />

      <div className="flex-1 lg:hidden" />

      {error && (
        <AuthNotice tone="error">
          <p>{error}</p>
        </AuthNotice>
      )}
      <Button type="submit" fullWidth disabled={pending}>
        {pending ? "Saving…" : "Save new password"}
      </Button>
    </form>
  );
}
