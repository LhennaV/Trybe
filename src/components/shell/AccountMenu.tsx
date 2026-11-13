"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { CaretUp, GearSix, Palette, Question, ShieldCheck, SignIn, User } from "@phosphor-icons/react";
import { useMe } from "@/components/profile/useMe";
import LogOutButton from "@/components/settings/LogOutButton";
import Avatar from "@/components/ui/Avatar";

const ITEM =
  "flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-body-s font-bold text-ink-900 hover:bg-brand-lavender-soft focus-visible:bg-brand-lavender-soft";

function MenuLink({ href, icon, children, onSelect }: { href: string; icon: ReactNode; children: ReactNode; onSelect: () => void }) {
  return (
    <Link href={href} role="menuitem" onClick={onSelect} className={ITEM}>
      <span className="text-ink-600" aria-hidden>
        {icon}
      </span>
      {children}
    </Link>
  );
}

// The account row at the bottom of the desktop sidebar. Opens a menu upward
// with your profile, settings, help, and Log out, like most desktop apps.
export default function AccountMenu() {
  const state = useMe();
  const me = state.status === "ready" ? state.me : null;
  const [open, setOpen] = useState(false);
  const wrapper = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);

  function close(returnFocus = false) {
    setOpen(false);
    if (returnFocus) trigger.current?.focus();
  }

  // Close on outside click. Focus the first item when it opens.
  useEffect(() => {
    if (!open) return;
    menu.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
    const onPointer = (event: PointerEvent) => {
      if (!wrapper.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [open]);

  // Arrow keys move between items, Escape closes, Tab leaves.
  function onMenuKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      close(true);
      return;
    }
    if (event.key === "Tab") {
      setOpen(false);
      return;
    }
    const items = Array.from(menu.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);
    const index = items.indexOf(document.activeElement as HTMLElement);
    const next =
      event.key === "ArrowDown" ? (index + 1) % items.length
      : event.key === "ArrowUp" ? (index - 1 + items.length) % items.length
      : event.key === "Home" ? 0
      : event.key === "End" ? items.length - 1
      : null;
    if (next === null) return;
    event.preventDefault();
    items[next]?.focus();
  }

  if (state.status === "signed-out") {
    return (
      <Link
        href="/login"
        className="flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-body-s font-bold text-brand-plum"
      >
        <SignIn size={18} weight="bold" aria-hidden />
        Log in
      </Link>
    );
  }

  return (
    <div ref={wrapper} className="relative">
      <button
        ref={trigger}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={me ? `Account menu for ${me.displayName}` : "Account menu"}
        onClick={() => setOpen((value) => !value)}
        className={`flex w-full items-center gap-2.5 rounded-xl px-1.5 py-2 text-left ${open ? "bg-brand-lavender-soft" : ""}`}
      >
        <Avatar name={me?.displayName ?? "?"} src={me?.photoUrl} size={36} />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-body-s font-bold text-ink-900">{me?.displayName ?? " "}</span>
          <span className="truncate text-caption text-ink-600">{me ? `@${me.handle}` : " "}</span>
        </span>
        <CaretUp
          size={18}
          weight="bold"
          aria-hidden
          className={`shrink-0 text-ink-600 transition-transform duration-200 ease-out motion-reduce:transition-none ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          ref={menu}
          role="menu"
          aria-label="Account"
          onKeyDown={onMenuKeyDown}
          className="absolute bottom-full left-0 z-30 mb-2 flex w-[300px] origin-bottom-left animate-pop-in flex-col rounded-[18px] bg-surface-white p-2 shadow-dropdown [&>hr]:my-1.5 [&>hr]:border-line"
        >
          {me && (
            <Link href="/profile" role="menuitem" onClick={() => close()} className={`${ITEM} gap-2.5 py-2`}>
              <Avatar name={me.displayName} src={me.photoUrl} size={40} />
              <span className="flex min-w-0 flex-col">
                <span className="truncate text-body-m font-bold text-ink-900">{me.displayName}</span>
                <span className="truncate text-caption font-normal text-ink-600">View your profile</span>
              </span>
            </Link>
          )}
          <hr />
          <MenuLink href="/settings/profile" icon={<User size={18} weight="bold" />} onSelect={() => close()}>
            Edit profile
          </MenuLink>
          <MenuLink href="/settings" icon={<GearSix size={18} weight="bold" />} onSelect={() => close()}>
            Settings
          </MenuLink>
          <MenuLink href="/settings/appearance" icon={<Palette size={18} weight="bold" />} onSelect={() => close()}>
            Appearance
          </MenuLink>
          <hr />
          <MenuLink href="/safety" icon={<ShieldCheck size={18} weight="bold" />} onSelect={() => close()}>
            Safety tips
          </MenuLink>
          <MenuLink href="/#faq" icon={<Question size={18} weight="bold" />} onSelect={() => close()}>
            Help and FAQ
          </MenuLink>
          <hr />
          <LogOutButton
            role="menuitem"
            iconSize={18}
            className={`${ITEM} text-status-danger hover:bg-status-danger/12 focus-visible:bg-status-danger/12 disabled:opacity-60`}
          />
          <p className="flex flex-wrap gap-x-3 px-3 pt-1.5 pb-1 text-caption text-ink-600">
            <Link href="/guidelines" onClick={() => close()} className="underline-offset-2 hover:underline">
              Guidelines
            </Link>
            <Link href="/terms" onClick={() => close()} className="underline-offset-2 hover:underline">
              Terms
            </Link>
            <Link href="/privacy" onClick={() => close()} className="underline-offset-2 hover:underline">
              Privacy
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}
