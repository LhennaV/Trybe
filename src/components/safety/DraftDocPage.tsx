import type { ReactNode } from "react";
import TopBar from "@/components/ui/TopBar";

// Layout for Terms, Privacy, and Community Guidelines. The text is a draft
// outline; the final wording is written by both of you before launch (SAFE-07).
export default function DraftDocPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-3.5 px-4 pt-2 pb-[max(24px,env(safe-area-inset-bottom))]">
      <TopBar title={title} backHref="/settings" />
      <p className="rounded-xl bg-status-warning-soft px-3.5 py-2.5 text-caption text-ink-900">
        Draft. This page isn&apos;t final yet.
      </p>
      <div className="flex flex-col gap-3 text-body-s text-ink-900 [&_h2]:text-title-m [&_h2]:text-ink-900 [&_li]:ml-5 [&_li]:list-disc [&_p]:text-ink-600">
        {children}
      </div>
    </main>
  );
}
