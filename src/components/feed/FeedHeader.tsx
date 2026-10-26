import Image from "next/image";
import { Bell } from "@phosphor-icons/react/dist/ssr";

// Mobile header: Storm in the box, the TRYBE wordmark, and notifications.
export default function FeedHeader() {
  return (
    <header className="flex items-center gap-2">
      <Image src="/brand/storm-icon.png" alt="" width={40} height={39} priority />
      <span className="font-display text-display-m text-brand-plum">TRYBE</span>
      <button
        type="button"
        aria-label="Notifications"
        className="relative ml-auto flex size-10 items-center justify-center rounded-xl border-[1.5px] border-line bg-surface-white text-ink-900 before:absolute before:-inset-0.5"
      >
        <Bell size={20} weight="bold" aria-hidden />
      </button>
    </header>
  );
}
