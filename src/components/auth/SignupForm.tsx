"use client";

import Link from "next/link";
import { useState } from "react";
import Button from "@/components/ui/Button";
import Checkbox from "@/components/ui/Checkbox";
import Input from "@/components/ui/Input";
import TurnstilePlaceholder from "./TurnstilePlaceholder";

// Minimum age is still an open decision (TRD section 21). 18 is a placeholder.
const MIN_AGE = 18;

export default function SignupForm() {
  const [notice, setNotice] = useState("");

  return (
    <form
      className="flex flex-1 flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        setNotice("Sign up isn't connected yet. It goes live once the accounts API is ready.");
      }}
    >
      <Input label="Display name" name="displayName" placeholder="e.g. Lhenna" autoComplete="nickname" required />
      <Input
        label="Handle"
        name="handle"
        placeholder="e.g. lhenna.crafts"
        autoComplete="username"
        autoCapitalize="none"
        required
      />
      <Input label="Email" name="email" type="email" placeholder="you@email.com" autoComplete="email" required />
      <Input
        label="Password"
        name="password"
        type="password"
        placeholder="At least 8 characters"
        autoComplete="new-password"
        minLength={8}
        required
      />
      <p className="text-caption text-ink-400">Your exact location stays private. Others only see your city.</p>

      <div className="flex flex-col">
        <Checkbox name="acceptTerms" required label="I agree to the Terms and Community Guidelines" />
        <Checkbox name="ageConfirmed" required label={`I'm ${MIN_AGE} or older`} />
      </div>

      <TurnstilePlaceholder />

      <div className="flex-1" />

      {notice && (
        <p role="status" className="rounded-xl bg-brand-lavender-soft px-3.5 py-3 text-body-s text-brand-plum-dark">
          {notice}
        </p>
      )}
      <Button type="submit" fullWidth>
        Create account
      </Button>
      <p className="text-center text-body-s text-ink-600">
        Already trading?{" "}
        <Link href="/login" className="font-extrabold text-brand-plum">
          Log in
        </Link>
      </p>
    </form>
  );
}
