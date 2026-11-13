"use client";

import Link from "next/link";
import { useRef, useState, type ReactNode } from "react";
import { CheckCircle } from "@phosphor-icons/react";
import { signUpSchema, type SignUp } from "@/shared/contracts/auth";
import { displayNameSchema } from "@/shared/contracts/users";
import { firstFieldErrors } from "@/components/api/request";
import Button, { buttonClassName } from "@/components/ui/Button";
import Chip from "@/components/ui/Chip";
import Input from "@/components/ui/Input";
import PasswordInput from "@/components/ui/PasswordInput";
import AgreementSheet from "./AgreementSheet";
import AuthNotice from "./AuthNotice";
import AuthScreen, { AuthHeading } from "./AuthScreen";
import { signUp } from "./authApi";
import { handleCandidates, inboxLink } from "./handleSuggestion";
import PasswordChecklist from "./PasswordChecklist";
import ResendVerification from "./ResendVerification";
import { emailProblem, passwordProblems } from "./signupChecks";
import Turnstile from "./Turnstile";
import { useHandleCheck, type HandleCheck } from "./useHandleCheck";
import { useTurnstile } from "./useTurnstile";

type Values = { displayName: string; email: string; password: string };
type Field = keyof Values;

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

// Under the display name: the handle it makes, and whether it's free. If it's
// taken, free alternatives to tap. Read aloud as it changes.
function HandleStatus({
  check,
  picked,
  onPick,
}: {
  check: HandleCheck;
  picked: string | null;
  onPick: (handle: string) => void;
}) {
  let content: ReactNode = "How people see you on Trybe. You can change it later.";
  if (check.status === "checking") content = `Checking @${check.handle}…`;
  if (check.status === "unknown") content = `You'll be @${check.handle}, or the closest free handle.`;
  if (check.status === "free") {
    content = (
      <span className="flex items-center gap-1 font-bold text-status-success">
        <CheckCircle size={14} weight="fill" aria-hidden />@{check.handle} is yours
      </span>
    );
  }
  if (check.status === "taken") {
    content = (
      <span className="flex flex-col gap-2">
        <span>
          <strong className="font-bold text-ink-900">@{check.handle}</strong> is taken.{" "}
          {check.suggestions.length > 0 ? "Pick one of these instead:" : "Try adding numbers or a word to your name."}
        </span>
        {check.suggestions.length > 0 && (
          <span className="flex flex-wrap gap-2" role="group" aria-label="Free handles">
            {check.suggestions.map((handle) => (
              <Chip key={handle} selected={picked === handle} onClick={() => onPick(handle)}>
                @{handle}
              </Chip>
            ))}
          </span>
        )}
      </span>
    );
  }
  return (
    <div aria-live="polite" className="-mt-2 text-caption text-ink-600">
      {content}
    </div>
  );
}

export default function SignupForm() {
  const [values, setValues] = useState<Values>({ displayName: "", email: "", password: "" });
  // A field shows its problems once you've left it, or after a submit try.
  const [touched, setTouched] = useState<Record<Field, boolean>>({ displayName: false, email: false, password: false });
  const [submitted, setSubmitted] = useState(false);
  const [pickedHandle, setPickedHandle] = useState<string | null>(null);
  const [agreementOpen, setAgreementOpen] = useState(false);
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const captcha = useTurnstile();
  const fieldRefs = useRef<Partial<Record<Field, HTMLInputElement | null>>>({});
  const handleCheck = useHandleCheck(values.displayName, values.email);

  // Problems right now, checked on every keystroke.
  const problems: Record<Field, string> = {
    displayName: displayNameSchema.safeParse(values.displayName).error?.issues[0]?.message ?? "",
    email: emailProblem(values.email),
    password: passwordProblems(values.password).length > 0 ? "Your password still needs what's below." : "",
  };
  const show = (field: Field) => serverErrors[field] || (touched[field] || submitted ? problems[field] : "");

  // The suggestion people tapped, or the first free one if the name is taken.
  const suggested = handleCheck.status === "taken" ? handleCheck.suggestions[0] : undefined;
  const chosenHandle = pickedHandle ?? suggested ?? null;

  function update(key: Field, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
    if (key === "displayName") setPickedHandle(null);
    if (serverErrors[key]) {
      setServerErrors((errors) => {
        const next = { ...errors };
        delete next[key];
        return next;
      });
    }
  }

  const touch = (key: Field) => setTouched((t) => (t[key] ? t : { ...t, [key]: true }));

  // Handles to try, best first: the picked or free one, then fallbacks in case
  // someone takes it in the meantime. acceptTerms and confirmAge are only sent
  // after the agreement sheet is done.
  function buildInput() {
    const fallbacks = handleCandidates(values.displayName, values.email);
    const candidates = [...new Set([chosenHandle, ...fallbacks].filter((h): h is string => Boolean(h)))];
    const input = {
      displayName: values.displayName,
      email: values.email.trim(),
      password: values.password,
      handle: candidates[0],
      acceptTerms: true,
      confirmAge: true,
    };
    return { candidates, parsed: signUpSchema.safeParse(input) };
  }

  // Create account: everything must pass first, then the agreement sheet.
  function handleSubmit() {
    setSubmitted(true);
    setError("");
    const firstBad = (["displayName", "email", "password"] as const).find((field) => problems[field]);
    if (firstBad) {
      fieldRefs.current[firstBad]?.focus();
      return;
    }
    if (!buildInput().parsed.success) {
      setError("Something in the form doesn't look right. Check each field.");
      return;
    }
    setAgreementOpen(true);
  }

  async function createAccount() {
    const { candidates, parsed } = buildInput();
    if (!parsed.success) return;

    setPending(true);

    // The API checks the handle before the bot check uses up the token, so
    // one token is enough for every handle we try.
    const input = { ...parsed.data, captchaToken: await captcha.getToken() } satisfies SignUp;
    let result = await signUp(input);
    for (const handle of candidates.slice(1)) {
      if (result.ok || result.code !== "HANDLE_TAKEN") break;
      result = await signUp({ ...input, handle });
    }
    // Each token works once, so the next try needs a fresh check.
    captcha.reset();
    setPending(false);
    setAgreementOpen(false);

    if (result.ok) {
      setSentTo(result.data.email);
      window.scrollTo({ top: 0 });
      return;
    }
    const fields = firstFieldErrors(result.fields);
    delete fields.handle;
    setServerErrors(fields);
    if (Object.keys(fields).length === 0) setError(result.message);
  }

  if (sentTo) return <CheckEmail email={sentTo} onChangeEmail={() => setSentTo(null)} />;

  const emailOk = values.email.trim() !== "" && !problems.email;

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
          ref={(el) => {
            fieldRefs.current.displayName = el;
          }}
          label="Display name"
          name="displayName"
          placeholder="e.g. stormi"
          autoComplete="nickname"
          value={values.displayName}
          onChange={(event) => update("displayName", event.target.value)}
          onBlur={() => touch("displayName")}
          error={show("displayName")}
        />
        {!show("displayName") && <HandleStatus check={handleCheck} picked={chosenHandle} onPick={setPickedHandle} />}

        <Input
          ref={(el) => {
            fieldRefs.current.email = el;
          }}
          label="Email"
          name="email"
          type="email"
          inputMode="email"
          placeholder="you@email.com"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          value={values.email}
          onChange={(event) => update("email", event.target.value)}
          onBlur={() => touch("email")}
          error={show("email")}
          trailing={
            emailOk ? (
              <span className="mr-4 flex shrink-0 text-status-success">
                <CheckCircle size={20} weight="fill" aria-hidden />
                <span className="sr-only">Email looks good</span>
              </span>
            ) : undefined
          }
        />

        <div className="flex flex-col gap-2">
          <PasswordInput
            ref={(el) => {
              fieldRefs.current.password = el;
            }}
            label="Password"
            name="password"
            placeholder="Make it a strong one"
            autoComplete="new-password"
            value={values.password}
            onChange={(event) => update("password", event.target.value)}
            onBlur={() => touch("password")}
            error={show("password")}
          />
          <PasswordChecklist password={values.password} showMissing={submitted || touched.password} />
        </div>

        <p className="text-caption text-ink-600">Your exact location stays private. Others only see your city.</p>

        <Turnstile controller={captcha} action="signup" />

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
