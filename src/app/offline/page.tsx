import type { Metadata } from "next";
import Image from "next/image";
import RetryButton from "@/components/pwa/RetryButton";

export const metadata: Metadata = { title: "You're offline", robots: { index: false } };

// Cached by the service worker and shown when the app opens without a connection.
export default function OfflinePage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center gap-3 px-4 text-center">
      <Image src="/brand/storm-icon.png" alt="" width={106} height={103} />
      <h1 className="font-display text-display-m text-ink-900">No connection, no trades</h1>
      <p className="max-w-[300px] text-body-s text-ink-600">
        Storm can&apos;t reach Trybe right now. Check your Wi-Fi or data and try again.
      </p>
      <RetryButton />
    </main>
  );
}
