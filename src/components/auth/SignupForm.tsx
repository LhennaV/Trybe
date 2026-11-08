"use client";

import Link from "next/link";
import { useState } from "react";
import { PASSWORD_MIN, signUpSchema, type SignUp } from "@/shared/contracts/auth";
import { firstFieldErrors, zodFieldErrors } from "@/components/api/request";
import Button, { buttonClassName } from "@/components/ui/Button";

import Input from "@/components/ui/Input";
import PasswordInput from "@/components/ui/PasswordInput";
import AgreementSheet from "./AgreementSheet";
import AuthNotice from "./AuthNotice";
import AuthScreen, { AuthHeading } from "./AuthScreen";
import { signUp } from "./authApi";
import { handleCandidates, inboxLink } from "./handleSuggestion";
import ResendVerification from "./ResendVerification";
import TurnstilePlaceholder from "./TurnstilePlaceholder";

type Values = { displayName: string; email: string; password: string };

// After sign up: the account exists and the verification email is on its way.
function CheckEmail({ email, onChangeEmail }: { email: string; onChangeEmail: () => void }) {
  const inbox = inboxLink(email);

  return (
    <AuthScreen>
      <AuthHeading
        title="Check your email"
        subtitle={
          <>
            We sent a link to <strong className="font-bold break-all text-ink-900">{email}</strong>. Tap it to
            finish signing up.
          </>
        }
      />
      <AuthNotice>
        <p>Can&apos;t find it? Check your Spam or Promotions folder.</p>
      </AuthNotice>

      <div className="flex-1 lg:hidden" />

      {inbox && (
        <a href={inbox.href} target="_blank" rel="noreferrer" className={buttonClassName({ fullWidth: true })}>
          {inbox.label}
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      )}
      <div className="flex flex-col items-center text-body-s">
        <ResendVerification email={email} startCoolingDown />
        <button type="button" onClick={onChangeEmail} className="flex min-h-11 items-center font-bold text-ink-600">
          Use a different email
        </button>
      </div>
    </AuthScreen>
  );
}

export default function SignupForm() {
  const [values, setValues] = useState<Values>({ displayName: "", email: "", password: "" });
  const [agreementOpen, setAgreementOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  function update<K extends keyof Values>(key: K, value: Values[K]) {
    setValues((v) => ({ ...v, [key]: value }));
    if (fieldErrors[key]) {
      setFieldErrors((errors) => {
        const next = { ...errors };
        delete next[key];
        return next;
      });
    }
  }

  // People don't pick a username here; one is made from their name and can be
  // changed later in Edit profile. If it's taken, the next one is tried.
  // acceptTerms and confirmAge are only true once the agreement sheet is done.
  function buildInput(agreed: boolean) {
    const candidates = handleCandidates(values.displayName, values.email);
    const input = {
      displayName: values.displayName,
      email: values.email,
      password: values.password,
      handle: candidates[0],
      acceptTerms: agreed,
      confirmAge: agreed,
    };
    return { candidates, parsed: signUpSchema.safeParse(input) };
  }

  // Create account: check the fields first, then show the agreement sheet.
  function handleSubmit() {
    const { parsed } = buildInput(true);
    if (!parsed.success) {
      setError("");
      setFieldErrors(zodFieldErrors(parsed.error));
      return;
    }
    setFieldErrors({});
    setError("");
    setAgreementOpen(true);
  }

  async function createAccount() {
    const { candidates, parsed } = buildInput(true);
    if (!parsed.success) return;

    setPending(true);

    let result = await signUp(parsed.data);
    for (const handle of candidates.slice(1)) {
      if (result.ok || result.code !== "HANDLE_TAKEN") break;
      result = await signUp({ ...parsed.data, handle } satisfies SignUp);
    }
    setPending(false);
    setAgreementOpen(false);

    if (result.ok) {
      setSentTo(result.data.email);
      window.scrollTo({ top: 0 });
      return;
    }
    const fields = firstFieldErrors(result.fields);
    delete fields.handle;
    setFieldErrors(fields);
    if (Object.keys(fields).length === 0) setError(result.message);
  }

  if (sentTo) return <CheckEmail email={sentTo} onChangeEmail={() => setSentTo(null)} />;

  return (
    <AuthScreen>
      <AuthHeading
        title="Join the Trybe"
        subtitle="Bring the gear you're done with. Leave with something new to try."
      />
      <form
        noValidate
        className="flex flex-1 flex-col gap-4 lg:flex-none"
        onSubmit={(event) => {
          event.preventDefault();
          handleSubmit();
        }}
      >
        <Input
          label="Display name"
          name="displayName"
          placeholder="e.g. stormi"
          autoComplete="nickname"
          value={values.displayName}
          onChange={(event) => update("displayName", event.target.value)}
          error={fieldErrors.displayName}
        />
        <Input
          label="Email"
          name="email"
          type="email"
          inputMode="email"
          placeholder="you@email.com"
          autoComplete="email"
          autoCapitalize="none"
          value={values.email}
          onChange={(event) => update("email", event.target.value)}
          error={fieldErrors.email}
        />
        <PasswordInput
          label="Password"
          name="password"
          placeholder={`At least ${PASSWORD_MIN} characters`}
          autoComplete="new-password"
          value={values.password}
          onChange={(event) => update("password", event.target.value)}
          error={fieldErrors.password}
        />
        <p className="text-caption text-ink-600">Your exact location stays private. Others only see your city.</p>

        <TurnstilePlaceholder />

        <div className="flex-1 lg:hidden" />

        {error && (
          <AuthNotice tone="error">
            <p>{error}</p>
          </AuthNotice>
        )}
        <Button type="submit" fullWidth disabled={pending}>
          {pending ? "Creating account…" : "Create account"}
        </Button>
        <AgreementSheet
          open={agreementOpen}
          pending={pending}
          onClose={() => setAgreementOpen(false)}
          onAgree={() => void createAccount()}
        />
        <p className="text-center text-body-s text-ink-600">
          Already trading?{" "}
          <Link href="/login" className="font-extrabold text-brand-plum">
            Log in
          </Link>
        </p>
      </form>
    </AuthScreen>
  );
}
