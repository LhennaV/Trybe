"use client";

import Link from "next/link";
import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import TurnstilePlaceholder from "./TurnstilePlaceholder";

export default function LoginForm() {
  const [notice, setNotice] = useState("");

  return (
    <form
      className="flex flex-1 flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        setNotice("Log in isn't connected yet. It goes live once the accounts API is ready.");
      }}
    >
      <Input label="Email" name="email" type="email" placeholder="you@email.com" autoComplete="email" required />
      <Input
        label="Password"
        name="password"
        type="password"
        placeholder="Your password"
        autoComplete="current-password"
        required
      />
      <Link href="/forgot-password" className="self-end text-body-s font-bold text-brand-plum">
        Forgot password?
      </Link>

      <TurnstilePlaceholder />

      <div className="flex-1" />

      {notice && (
        <p role="status" className="rounded-xl bg-brand-lavender-soft px-3.5 py-3 text-body-s text-brand-plum-dark">
          {notice}
        </p>
      )}
      <Button type="submit" fullWidth>
        Log in
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
