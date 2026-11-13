"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { logInSchema } from "@/shared/contracts/auth";
import { firstFieldErrors, zodFieldErrors } from "@/components/api/request";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import PasswordInput from "@/components/ui/PasswordInput";
import { resetMe } from "@/components/profile/useMe";
import AuthNotice from "./AuthNotice";
import { logIn } from "./authApi";
import ResendVerification from "./ResendVerification";
import Turnstile from "./Turnstile";
import { useTurnstile } from "./useTurnstile";

type Notice = { tone: "info" | "error"; body: ReactNode } | null;

// `linkInvalid`: the page was opened from an expired or used email link
// (AUTH_REDIRECTS.invalidLink, /login?error=link_invalid).
export default function LoginForm({ linkInvalid = false }: { linkInvalid?: boolean }) {
  const router = useRouter();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<Notice>(
    linkInvalid
      ? {
          tone: "info",
          body: (
            <p>
              <strong className="font-bold">That link expired.</strong> Log in to get a new one, or{" "}
              <Link href="/forgot-password" className="font-bold text-brand-plum underline underline-offset-2">
                reset your password
              </Link>
              .
            </p>
          ),
        }
      : null,
  );
  const [pending, setPending] = useState(false);
  const captcha = useTurnstile();

  async function handleSubmit(form: HTMLFormElement) {
    const data = new FormData(form);
    const parsed = logInSchema.safeParse({ email: data.get("email"), password: data.get("password") });
    if (!parsed.success) {
      setFieldErrors(zodFieldErrors(parsed.error));
      return;
    }

    setFieldErrors({});
    setNotice(null);
    setPending(true);
    const result = await logIn({ ...parsed.data, captchaToken: await captcha.getToken() });
    // Each token works once, so the next try needs a fresh check.
    captcha.reset();

    if (result.ok) {
      resetMe();
      router.replace("/feed");
      router.refresh();
      return;
    }

    setPending(false);
    if (result.code === "EMAIL_NOT_VERIFIED") {
      setNotice({
        tone: "info",
        body: (
          <>
            <p>
              <strong className="font-bold">Verify your email first.</strong> Tap the link we sent to{" "}
              {parsed.data.email}.
            </p>
            <ResendVerification email={parsed.data.email} />
          </>
        ),
      });
      return;
    }
    setFieldErrors(firstFieldErrors(result.fields));
    setNotice({ tone: "error", body: <p>{result.message}</p> });
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
        inputMode="email"
        placeholder="you@email.com"
        autoComplete="email"
        autoCapitalize="none"
        error={fieldErrors.email}
      />
      <PasswordInput
        label="Password"
        name="password"
        placeholder="Your password"
        autoComplete="current-password"
        error={fieldErrors.password}
      />
      <Link
        href="/forgot-password"
        className="-my-2 flex min-h-11 items-center self-end text-body-s font-bold text-brand-plum"
      >
        Forgot password?
      </Link>

      <Turnstile controller={captcha} action="login" />

      <div className="flex-1 lg:hidden" />

      {notice && <AuthNotice tone={notice.tone}>{notice.body}</AuthNotice>}
      <Button type="submit" fullWidth disabled={pending}>
        {pending ? "Logging in…" : "Log in"}
      </Button>
      <p className="text-center text-body-s text-ink-600">
        New here?{" "}
        <Link href="/signup" className="font-extrabold text-brand-plum">
          Create an account
        </Link>
      </p>
    </form>
  );
}
