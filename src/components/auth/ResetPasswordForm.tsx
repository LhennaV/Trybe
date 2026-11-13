"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCircle } from "@phosphor-icons/react";
import { newPasswordSchema } from "@/shared/contracts/auth";
import { firstFieldErrors } from "@/components/api/request";
import Button, { buttonClassName } from "@/components/ui/Button";
import PasswordInput from "@/components/ui/PasswordInput";
import AuthNotice from "./AuthNotice";
import { setNewPassword } from "./authApi";
import PasswordChecklist from "./PasswordChecklist";
import { passwordProblems } from "./signupChecks";

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
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [confirmTouched, setConfirmTouched] = useState(false);

  // Checked as you type, same rules as sign up.
  const weak = passwordProblems(password).length > 0;
  const matches = confirm !== "" && confirm === password;
  const mismatch = confirm !== "" && !matches && (confirmTouched || confirm.length >= password.length);
  const passwordError = fieldErrors.password || (submitted && weak ? "Your password still needs what's below." : "");
  const confirmError =
    fieldErrors.confirmPassword ||
    (mismatch ? "Those don't match yet." : submitted && !confirm ? "Type your new password again." : "");

  async function handleSubmit() {
    setSubmitted(true);
    const parsed = newPasswordSchema.safeParse({ password });
    if (weak || !parsed.success || !matches) return;

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
        void handleSubmit();
      }}
    >
      <div className="flex flex-col gap-2">
        <PasswordInput
          label="New password"
          name="password"
          placeholder="Make it a strong one"
          autoComplete="new-password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            setFieldErrors({});
          }}
          error={passwordError}
        />
        <PasswordChecklist password={password} showMissing={submitted} />
      </div>
      <PasswordInput
        label="Type it again"
        name="confirmPassword"
        placeholder="Same password"
        autoComplete="new-password"
        value={confirm}
        onChange={(event) => setConfirm(event.target.value)}
        onBlur={() => setConfirmTouched(true)}
        error={confirmError}
        hint={
          matches ? (
            <span aria-live="polite" className="flex items-center gap-1 font-bold text-status-success">
              <CheckCircle size={14} weight="fill" aria-hidden />
              Passwords match
            </span>
          ) : undefined
        }
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
