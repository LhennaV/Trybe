import type { Metadata } from "next";
import BlockedUsers from "@/components/safety/BlockedUsers";
import TopBar from "@/components/ui/TopBar";

export const metadata: Metadata = { title: "Blocked users", robots: { index: false } };

export default function BlockedUsersPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-3.5 px-4 pt-2 pb-[max(24px,env(safe-area-inset-bottom))]">
      <TopBar title="Blocked users" backHref="/settings" />
      <p className="text-body-s text-ink-600">
        Blocked people can&apos;t message you, see your posts, or propose trades. They aren&apos;t told you blocked them.
      </p>
      {/* Empty until the blocks endpoint exists (Phase 5, SAFE-02), so real accounts never see sample people. */}
      <BlockedUsers initial={[]} />
    </main>
  );
}
