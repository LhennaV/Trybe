"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, ShieldCheck } from "@phosphor-icons/react";
import LevelBadge from "@/components/badges/LevelBadge";
import { buttonClassName } from "@/components/ui/Button";
import { NAV_ITEMS, NEW_POST_HREF, isActive } from "./navItems";

// Desktop only (lg and up). Below lg, BottomNav is used instead.
export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col gap-6 border-r border-line bg-surface-white px-4 py-6 lg:flex">
      <Link href="/" className="px-3 font-display text-display-m text-brand-plum">
        Trybe
      </Link>

      <nav aria-label="Main" className="flex flex-col gap-1">
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
                active
                  ? "bg-brand-lavender-soft font-extrabold text-brand-plum"
                  : "font-bold text-ink-600",
              ].join(" ")}
            >
              <Icon size={22} weight={active ? "fill" : "bold"} aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <Link href={NEW_POST_HREF} className={buttonClassName({ fullWidth: true })}>
        <Plus size={20} weight="bold" aria-hidden />
        New post
      </Link>

      <div className="mt-auto flex flex-col gap-4">
        <div className="flex flex-col gap-1.5 rounded-card bg-status-success-soft p-4">
          <p className="flex items-center gap-2 text-body-s font-bold text-status-success">
            <ShieldCheck size={18} weight="bold" aria-hidden />
            Trade safely
          </p>
          <p className="text-caption text-ink-600">
            Meet somewhere public, check the gear before you swap, and keep the chat on Trybe.
          </p>
        </div>

        {/* Placeholder account until auth is wired up. Storm is the prototype's sample user. */}
        <Link href="/profile" className="flex items-center gap-3 rounded-xl px-1 py-1">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-chip bg-brand-box-soft text-body-m font-extrabold text-brand-box-dark">
            S
          </span>
          <span className="flex min-w-0 flex-col items-start gap-0.5">
            <span className="text-body-s font-bold text-ink-900">Storm</span>
            <LevelBadge completedTrades={0} />
          </span>
        </Link>
      </div>
    </aside>
  );
}
