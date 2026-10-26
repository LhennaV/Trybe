"use client";

import { useSyncExternalStore } from "react";
import { WifiSlash } from "@phosphor-icons/react";

function subscribe(onChange: () => void) {
  window.addEventListener("online", onChange);
  window.addEventListener("offline", onChange);
  return () => {
    window.removeEventListener("online", onChange);
    window.removeEventListener("offline", onChange);
  };
}

// Dark strip at the top when the connection drops (Figma "Feed · Offline").
// What's already on screen stays usable; new loads wait for the connection.
export default function OfflineBanner() {
  const online = useSyncExternalStore(subscribe, () => navigator.onLine, () => true);
  if (online) return null;

  return (
    <div role="status" className="sticky top-0 z-30 -mx-4 -mt-1.5 mb-1.5 flex items-center gap-2 bg-ink-900 px-4 py-2.5 text-caption text-brand-cream lg:mx-0 lg:mt-0">
      <WifiSlash size={16} weight="bold" aria-hidden />
      <span className="flex-1">You&apos;re offline. Showing what was already loaded.</span>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="min-h-11 font-extrabold text-brand-lavender"
      >
        Retry
      </button>
    </div>
  );
}
