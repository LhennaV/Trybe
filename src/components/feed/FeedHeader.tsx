import Image from "next/image";
import { Bell } from "@phosphor-icons/react/dist/ssr";
import { SAMPLE_NOTIFICATIONS } from "@/components/notifications/sampleNotifications";
import IconButton from "@/components/ui/IconButton";

// Mobile header: Storm in the box, the TRYBE wordmark, and notifications.
export default function FeedHeader() {
  const unread = SAMPLE_NOTIFICATIONS.filter((n) => n.unread).length;

  return (
    <header className="flex items-center gap-2">
      <Image src="/brand/storm-icon.png" alt="" width={40} height={39} priority />
      <span className="font-display text-display-m text-brand-plum">TRYBE</span>
      <IconButton
        href="/notifications"
        label={unread > 0 ? `Notifications, ${unread} unread` : "Notifications"}
        className="ml-auto"
      >
        <Bell size={20} weight="bold" aria-hidden />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 flex min-w-[18px] items-center justify-center rounded-chip bg-status-danger px-1 text-caption font-extrabold text-surface-white">
            {unread}
          </span>
        )}
      </IconButton>
    </header>
  );
}
