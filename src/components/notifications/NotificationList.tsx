"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowsLeftRight,
  CalendarBlank,
  Check,
  Heart,
  ShieldCheck,
  Sparkle,
  Star,
  type Icon,
} from "@phosphor-icons/react";
import { buttonClassName } from "@/components/ui/Button";
import TopBar from "@/components/ui/TopBar";
import type { AppNotification, NotificationKind } from "./sampleNotifications";

const LOOKS: Record<NotificationKind, { icon: Icon; className: string }> = {
  offer: { icon: ArrowsLeftRight, className: "bg-brand-plum text-surface-white" },
  accepted: { icon: Check, className: "bg-status-success text-surface-white" },
  meetup: { icon: CalendarBlank, className: "bg-status-warning-soft text-status-warning" },
  rating: { icon: Star, className: "bg-brand-box-soft text-brand-box-dark" },
  like: { icon: Heart, className: "bg-brand-blush text-ink-900" },
  match: { icon: Sparkle, className: "bg-brand-lavender-soft text-brand-plum" },
  safety: { icon: ShieldCheck, className: "bg-status-success-soft text-status-success" },
};

export function NotificationRow({ notification, compact = false }: { notification: AppNotification; compact?: boolean }) {
  const { icon: Icon, className } = LOOKS[notification.kind];
  return (
    <li
      className={`flex items-start gap-3 rounded-card ${compact ? "p-2.5" : "p-3"} ${
        notification.unread
          ? "bg-brand-lavender-soft"
          : compact
            ? "bg-surface-white"
            : "border-[1.5px] border-line bg-surface-white"
      }`}
    >
      <span className={`flex size-[38px] shrink-0 items-center justify-center rounded-xl ${className}`}>
        <Icon size={19} weight="bold" aria-hidden />
      </span>
      <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
        <p className="text-body-s text-ink-900">{notification.body}</p>
        <p className="text-caption text-ink-400">{notification.time}</p>
        {notification.action && (
          <Link href={notification.action.href} className={buttonClassName({ className: "px-3.5 py-[7px]" })}>
            {notification.action.label}
          </Link>
        )}
      </div>
      {notification.unread && (
        <span className="mt-1 size-[9px] shrink-0 rounded-chip bg-brand-plum">
          <span className="sr-only">Unread</span>
        </span>
      )}
    </li>
  );
}

export function useNotifications(initial: AppNotification[]) {
  const [notifications, setNotifications] = useState(initial);
  const markAllRead = () => setNotifications((list) => list.map((n) => ({ ...n, unread: false })));
  return { notifications, markAllRead, anyUnread: notifications.some((n) => n.unread) };
}

// In-app notifications page (NOTIF-01). Read state is local until the
// notification endpoints exist.
export default function NotificationList({ notifications: initial }: { notifications: AppNotification[] }) {
  const { notifications, markAllRead, anyUnread } = useNotifications(initial);

  return (
    <>
      <TopBar
        title="Notifications"
        backHref="/"
        action={
          anyUnread && (
            <button type="button" onClick={markAllRead} className="min-h-11 text-body-s font-bold text-brand-plum">
              Mark all read
            </button>
          )
        }
      />
      {(["today", "earlier"] as const).map((group) => {
        const items = notifications.filter((n) => n.group === group);
        if (items.length === 0) return null;
        return (
          <section key={group} className="flex flex-col gap-2">
            <h2 className="text-label-s uppercase text-ink-400">{group}</h2>
            <ul className="flex flex-col gap-2">
              {items.map((notification) => (
                <NotificationRow key={notification.id} notification={notification} />
              ))}
            </ul>
          </section>
        );
      })}
    </>
  );
}
