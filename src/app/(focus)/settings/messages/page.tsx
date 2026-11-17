import type { Metadata } from "next";
import MessagePermissionSettings from "@/components/settings/MessagePermissionSettings";
import TopBar from "@/components/ui/TopBar";

export const metadata: Metadata = { title: "Who can message me", robots: { index: false } };

export default function MessageSettingsPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-3.5 px-4 pt-2 pb-[max(24px,env(safe-area-inset-bottom))]">
      <TopBar title="Who can message me" backHref="/settings" />
      <p className="text-body-s text-ink-600">
        Pick who can start a chat with you. Keep chats on Trybe and never send money ahead of a meetup.
      </p>
      <MessagePermissionSettings />
    </main>
  );
}
