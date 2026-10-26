"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Bell } from "@phosphor-icons/react";
import IconButton from "@/components/ui/IconButton";
import { NotificationRow, useNotifications } from "./NotificationList";
import { SAMPLE_NOTIFICATIONS } from "./sampleNotifications";

// Bell with an unread count (NOTIF-01). On mobile it opens the Notifications
// screen; from lg up it opens a dropdown, as in the desktop Figma.
export default function NotificationBell({ className = "" }: { className?: string }) {
  const router = useRouter();
  const { notifications, markAllRead, anyUnread } = useNotifications(SAMPLE_NOTIFICATIONS);
  const [open, setOpen] = useState(false);
  const wrapper = useRef<HTMLDivElement>(null);
  const unread = notifications.filter((n) => n.unread).length;

  // Close on outside click or Escape.
  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!wrapper.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={wrapper} className={`relative ${className}`}>
      <IconButton
        label={unread > 0 ? `Notifications, ${unread} unread` : "Notifications"}
        aria-expanded={open}
        aria-haspopup="dialog"
        className={open ? "bg-brand-lavender-soft" : ""}
        onClick={() => {
          if (matchMedia("(min-width: 1024px)").matches) setOpen((value) => !value);
          else router.push("/notifications");
        }}
      >
        <Bell size={20} weight={open ? "fill" : "bold"} aria-hidden />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 flex min-w-[18px] items-center justify-center rounded-chip bg-status-danger px-1 text-caption font-extrabold text-surface-white">
            {unread}
          </span>
        )}
      </IconButton>

      {open && (
        <div
          role="dialog"
          aria-label="Notifications"
          className="absolute top-12 right-0 z-30 flex w-[300px] flex-col gap-2 rounded-[18px] bg-surface-white p-3 shadow-dropdown"
        >
          <div className="flex items-center px-1">
            <h2 className="text-title-m text-ink-900">Notifications</h2>
            {anyUnread && (
              <button type="button" onClick={markAllRead} className="ml-auto min-h-11 text-body-s font-bold text-brand-plum">
                Mark all read
              </button>
            )}
          </div>
          <ul className="flex flex-col gap-1">
            {notifications.slice(0, 5).map((notification) => (
              <NotificationRow key={notification.id} notification={notification} compact />
            ))}
          </ul>
          <Link
            href="/notifications"
            onClick={() => setOpen(false)}
            className="flex min-h-11 items-center justify-center text-body-s font-bold text-brand-plum"
          >
            See all notifications
          </Link>
        </div>
      )}
    </div>
  );
}
