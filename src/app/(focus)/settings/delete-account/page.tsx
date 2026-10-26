import type { Metadata } from "next";
import DeleteAccountForm from "@/components/safety/DeleteAccountForm";
import TopBar from "@/components/ui/TopBar";

export const metadata: Metadata = { title: "Delete account", robots: { index: false } };

export default function DeleteAccountPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-3.5 px-4 pt-2 pb-[max(24px,env(safe-area-inset-bottom))]">
      <TopBar title="Delete account" backHref="/settings" />
      <h1 className="font-display text-display-m text-ink-900">Sad to see you go</h1>
      <p className="text-body-s text-ink-600">
        If something went wrong, you can also take a break: log out, or mute and block anyone bothering you.
      </p>
      <DeleteAccountForm />
    </main>
  );
}
