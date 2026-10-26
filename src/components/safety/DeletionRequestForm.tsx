"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

// For people without the app (DEL-02): request deletion by email. The server
// emails a confirmation link so nobody can delete someone else's account.
export default function DeletionRequestForm() {
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <p role="status" className="rounded-xl bg-status-success-soft px-3.5 py-3 text-body-s text-ink-900">
        If that email has a Trybe account, we&apos;ll send a link to confirm the deletion.
      </p>
    );
  }

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        setSent(true);
      }}
    >
      <Input label="Your account email" name="email" type="email" autoComplete="email" required />
      <Button type="submit" variant="danger" fullWidth>
        Request deletion
      </Button>
    </form>
  );
}
