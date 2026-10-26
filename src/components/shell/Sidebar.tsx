"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GearSix, ShieldCheck } from "@phosphor-icons/react";
import { MY_PROFILE } from "@/components/profile/sampleProfiles";
import { SAMPLE_TRADES } from "@/components/trades/sampleTrades";
import { canRespond } from "@/components/trades/tradeModel";
import Avatar from "@/components/ui/Avatar";
import { buttonClassName } from "@/components/ui/Button";
import { NAV_ITEMS, NEW_POST_HREF, isActive } from "./navItems";

// Desktop only (lg and up), matching the Figma "Desktop Sidebar" component.
// Below lg, BottomNav is used instead.
export default function Sidebar() {
  const pathname = usePathname();
  // Trades waiting on you. Sample data until the trades endpoint exists.
  const tradesBadge = SAMPLE_TRADES.filter(canRespond).length;

  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col gap-1.5 border-r border-line bg-surface-white px-5 pt-7 pb-6 lg:flex">
      <Link href="/" className="flex items-center gap-2 pb-[22px] pl-1.5" aria-label="Trybe home">
        <Image src="/brand/storm-icon.png" alt="" width={42} height={41} />
        <span className="font-display text-display-m text-brand-plum">TRYBE</span>
      </Link>

      <nav aria-label="Main" className="flex flex-col gap-1.5">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={[
                "flex items-center gap-3 rounded-xl px-3 py-[11px] text-body-m",
                active ? "bg-brand-lavender-soft font-extrabold text-brand-plum" : "text-ink-600",
              ].join(" ")}
            >
              <Icon size={22} weight={active ? "fill" : "bold"} aria-hidden />
              {item.label}
              {item.href === "/trades" && tradesBadge > 0 && (
                <span className="ml-auto rounded-chip bg-brand-plum px-2 py-0.5 text-caption font-extrabold text-surface-white">
                  {tradesBadge}
                  <span className="sr-only"> waiting on you</span>
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <Link href={NEW_POST_HREF} className={buttonClassName({ fullWidth: true, className: "mt-3" })}>
        New post
      </Link>

      <div className="mt-auto flex flex-col gap-1.5">
        <Link href="/safety" className="flex flex-col gap-1.5 rounded-card bg-status-success-soft p-3.5">
          <span className="flex items-center gap-1.5 text-body-s font-bold text-ink-900">
            <ShieldCheck size={16} weight="bold" className="text-status-success" aria-hidden />
            Trade safely
          </span>
          <span className="text-caption text-ink-600">
            Meet in public, inspect before you swap, and hand over cash only at the meetup.
          </span>
        </Link>

        <div className="flex items-center gap-2.5 px-1.5 py-2.5">
          <Link href="/profile" className="flex min-w-0 flex-1 items-center gap-2.5">
            <Avatar name={MY_PROFILE.displayName} size={36} />
            <span className="flex min-w-0 flex-col">
              <span className="text-body-s font-bold text-ink-900">Your profile</span>
              <span className="text-caption text-ink-600">
                ★ {MY_PROFILE.rating.toFixed(1)} · {MY_PROFILE.tradeCount} trades
              </span>
            </span>
          </Link>
          <Link href="/settings" aria-label="Settings" className="relative text-ink-600 before:absolute before:-inset-3">
            <GearSix size={18} weight="bold" aria-hidden />
          </Link>
        </div>
      </div>
    </aside>
  );
}
