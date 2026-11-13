"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck } from "@phosphor-icons/react";
import { SAMPLE_TRADES } from "@/components/trades/sampleTrades";
import { canRespond } from "@/components/trades/tradeModel";
import { buttonClassName } from "@/components/ui/Button";
import { BRAND, brandSize } from "@/shared/brand";
import AccountMenu from "./AccountMenu";
import { NAV_ITEMS, NEW_POST_HREF, isActive } from "./navItems";

// Desktop only (lg and up), matching the Figma "Desktop Sidebar" component.
// Below lg, BottomNav is used instead.
export default function Sidebar() {
  const pathname = usePathname();
  // Trades waiting on you. Sample data until the trades endpoint exists.
  const tradesBadge = SAMPLE_TRADES.filter(canRespond).length;

  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col gap-1.5 border-r border-line bg-surface-white px-5 pt-7 pb-6 lg:flex">
      <Link href="/feed" className="flex items-center gap-2 pb-[22px] pl-1.5" aria-label="Trybe home">
        <Image {...BRAND.icon} {...brandSize(BRAND.icon, 41)} alt="" />
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

        <AccountMenu />
      </div>
    </aside>
  );
}
