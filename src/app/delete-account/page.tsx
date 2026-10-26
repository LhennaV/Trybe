import type { Metadata } from "next";
import Link from "next/link";
import DeletionRequestForm from "@/components/safety/DeletionRequestForm";

export const metadata: Metadata = {
  title: "Delete your Trybe account",
  description: "How to delete your Trybe account and what happens to your data.",
};

// Public account deletion page, linked from the Play Store Data safety form (DEL-02).
// Works without logging in or installing the app.
export default function PublicDeleteAccountPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 py-8">
      <h1 className="font-display text-display-l text-brand-plum">Delete your Trybe account</h1>

      <section className="flex flex-col gap-2">
        <h2 className="text-title-m text-ink-900">In the app</h2>
        <p className="text-body-s text-ink-600">
          Go to Profile › Settings › Delete account, or{" "}
          <Link href="/settings/delete-account" className="font-bold text-brand-plum underline">
            open it here
          </Link>{" "}
          if you&apos;re logged in.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-title-m text-ink-900">Without the app</h2>
        <p className="text-body-s text-ink-600">Enter the email on your account and we&apos;ll send a link to confirm.</p>
        <DeletionRequestForm />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-title-m text-ink-900">What gets deleted</h2>
        <ul className="flex list-disc flex-col gap-1 pl-5 text-body-s text-ink-600">
          <li>Your profile, photos, posts, gear, and messages.</li>
          <li>Trades in progress are cancelled and reserved gear is released.</li>
        </ul>
      </section>
    </main>
  );
}
