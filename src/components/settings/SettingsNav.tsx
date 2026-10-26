"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GearSix, Palette, Prohibit, SignOut, Trash, User, type Icon } from "@phosphor-icons/react";

const ITEMS: { href: string; label: string; icon: Icon }[] = [
  { href: "/settings", label: "All settings", icon: GearSix },
  { href: "/settings/profile", label: "Profile", icon: User },
  { href: "/settings/appearance", label: "Appearance", icon: Palette },
  { href: "/settings/blocked", label: "Blocked users", icon: Prohibit },
  { href: "/settings/delete-account", label: "Delete account", icon: Trash },
];

// Desktop settings menu, left of the settings screens (Figma "Desktop · Settings").
export default function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Settings" className="sticky top-7 hidden flex-col gap-1 self-start lg:flex">
      <p className="px-3 pb-3 font-display text-display-l text-brand-plum">Settings</p>
      {ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-body-s ${
              active ? "bg-brand-lavender-soft font-extrabold text-brand-plum" : "text-ink-600"
            }`}
          >
            <Icon size={16} weight={active ? "fill" : "bold"} aria-hidden />
            {label}
          </Link>
        );
      })}
      <button type="button" className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-body-s text-status-danger">
        <SignOut size={16} weight="bold" aria-hidden />
        Log out
      </button>
    </nav>
  );
}
