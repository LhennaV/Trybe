"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "@phosphor-icons/react";
import { NAV_ITEMS, NEW_POST_HREF, isActive, type NavItem } from "./navItems";

function NavTab({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={[
        "flex min-h-11 min-w-11 flex-col items-center gap-1 text-caption",
        active ? "font-extrabold text-brand-plum" : "text-ink-400",
      ].join(" ")}
    >
      <Icon size={24} weight={active ? "fill" : "bold"} aria-hidden />
      {item.label}
    </Link>
  );
}

// Mobile only. Hidden at lg and up, where the sidebar takes over.
// 86px tall: 10px top padding, the 52px post button, and 24px at the bottom
// (or the safe area, if it's bigger).
export default function BottomNav() {
  const pathname = usePathname();
  const [feed, explore, trades, profile] = NAV_ITEMS.filter((item) => !item.desktopOnly);

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface-white lg:hidden"
    >
      <div className="mx-auto flex max-w-[390px] items-start justify-between px-[26px] pt-2.5 pb-[max(24px,env(safe-area-inset-bottom))]">
        <NavTab item={feed} active={isActive(pathname, feed.href)} />
        <NavTab item={explore} active={isActive(pathname, explore.href)} />
        <Link
          href={NEW_POST_HREF}
          aria-label="New post"
          aria-current={isActive(pathname, NEW_POST_HREF) ? "page" : undefined}
          className="flex size-[52px] shrink-0 items-center justify-center rounded-[18px] bg-brand-plum text-surface-white shadow-button transition-transform duration-200 ease-out active:translate-y-[3px] active:shadow-none"
        >
          <Plus size={26} weight="bold" aria-hidden />
        </Link>
        <NavTab item={trades} active={isActive(pathname, trades.href)} />
        <NavTab item={profile} active={isActive(pathname, profile.href)} />
      </div>
    </nav>
  );
}
