"use client";

import Link from "next/link";
import { useState } from "react";
import { emailRequestSchema } from "@/shared/contracts/auth";
import { firstFieldErrors, zodFieldErrors } from "@/components/api/request";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import AuthNotice from "./AuthNotice";
import { requestPasswordReset } from "./authApi";
import Turnstile from "./Turnstile";
import { useTurnstile } from "./useTurnstile";

// Emails a reset link (AUTH-06). The API answers the same way whether or not
// the email has an account, so the copy here never says "we found you".
export default function ForgotPasswordForm() {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const captcha = useTurnstile();

  async function handleSubmit(form: HTMLFormElement) {
    const parsed = emailRequestSchema.safeParse({ email: new FormData(form).get("email") });
    if (!parsed.success) {
      setFieldErrors(zodFieldErrors(parsed.error));
      return;
    }

    setFieldErrors({});
    setError("");
    setPending(true);
    const result = await requestPasswordReset({ ...parsed.data, captchaToken: await captcha.getToken() });
    captcha.reset();
    setPending(false);

    if (result.ok) {
      setSentTo(parsed.data.email);
    } else {
      setFieldErrors(firstFieldErrors(result.fields));
      setError(result.message);
    }
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
      <Input
        label="Email"
        name="email"
        type="email"
        placeholder="you@email.com"
        autoComplete="email"
        required
        error={fieldErrors.email}
      />

      <Turnstile controller={captcha} action="forgot_password" />

      {sentTo && (
        <AuthNotice tone="success">
          <p className="font-bold">Check your inbox.</p>
          <p>
            If {sentTo} has a Trybe account, a reset link is on its way. It works once, so use the newest one.
          </p>
        </AuthNotice>
      )}

      <div className="flex-1 lg:hidden" />

      {error && (
        <AuthNotice tone="error">
          <p>{error}</p>
        </AuthNotice>
      )}
      <Button type="submit" fullWidth disabled={pending}>
        {pending ? "Sending…" : sentTo ? "Send another link" : "Send reset link"}
      </Button>
      <p className="text-center text-body-s text-ink-600">
        Remembered it?{" "}
        <Link href="/login" className="font-extrabold text-brand-plum">
          Log in
        </Link>
      </p>
    </form>
  );
}
