import type { Metadata } from "next";
import Link from "next/link";
import {
  BookmarkSimple,
  BookOpen,
  EnvelopeSimple,
  Key,
  MapPin,
  Palette,
  Prohibit,
  ShieldCheck,
  Tray,
  User,
} from "@phosphor-icons/react/dist/ssr";
import LogOutButton from "@/components/settings/LogOutButton";
import NotificationToggles from "@/components/settings/NotificationToggles";
import AccountValue from "@/components/settings/AccountValue";
import { SettingsGroup, SettingsLinkRow } from "@/components/settings/SettingsList";
import ThemeValue from "@/components/settings/ThemeValue";
import TopBar from "@/components/ui/TopBar";

export const metadata: Metadata = {
  title: "Settings",
};

// Settings (SET-01). Email and "Who can message me" come from GET /api/me.
// Notification toggles are still local until their endpoint exists (NOTIF-03).
export default function SettingsPage() {
  const icon = { size: 18, weight: "bold" as const, "aria-hidden": true };

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-3.5 px-4 pt-2 pb-[max(24px,env(safe-area-inset-bottom))]">
      <TopBar title="Settings" backHref="/profile" />

      <SettingsGroup title="Account">
        <SettingsLinkRow icon={<User {...icon} />} label="Edit profile" href="/settings/profile" />
        <SettingsLinkRow icon={<BookmarkSimple {...icon} />} label="Saved" href="/saved" />
        {/* No screen yet: changing your email needs a backend endpoint (AUTH-07). */}
        <SettingsLinkRow icon={<EnvelopeSimple {...icon} />} label="Email" value={<AccountValue field="email" />} />
        <SettingsLinkRow icon={<Key {...icon} />} label="Password" href="/forgot-password" />
      </SettingsGroup>

      <SettingsGroup title="Appearance">
        <SettingsLinkRow
          icon={<Palette {...icon} />}
          label="Theme & contrast"
          value={<ThemeValue />}
          href="/settings/appearance"
        />
      </SettingsGroup>

      <SettingsGroup title="Privacy & safety">
        <SettingsLinkRow
          icon={<Tray {...icon} />}
          label="Who can message me"
          value={<AccountValue field="messagePermission" />}
          href="/settings/messages"
        />
        <SettingsLinkRow icon={<Prohibit {...icon} />} label="Blocked users" href="/settings/blocked" />
        {/* Not a choice: Trybe only ever shows your city (PROF-05). */}
        <SettingsLinkRow icon={<MapPin {...icon} />} label="Location shown" value="City only" />
        <SettingsLinkRow icon={<ShieldCheck {...icon} />} label="Safe trading tips" href="/safety" />
      </SettingsGroup>

      <SettingsGroup title="Notifications">
        <NotificationToggles />
      </SettingsGroup>

      <SettingsGroup title="About">
        <SettingsLinkRow icon={<BookOpen {...icon} />} label="Community guidelines" href="/guidelines" />
        <SettingsLinkRow icon={<BookOpen {...icon} />} label="Terms" href="/terms" />
        <SettingsLinkRow icon={<BookOpen {...icon} />} label="Privacy notice" href="/privacy" />
      </SettingsGroup>

      <LogOutButton className="mt-1 flex min-h-11 items-center justify-center gap-2 rounded-card border-[1.5px] border-line bg-surface-white px-3.5 py-[13px] text-body-m font-bold text-status-danger disabled:opacity-60" />
      {/* Account deletion must be reachable in the app (DEL-01). */}
      <Link
        href="/settings/delete-account"
        className="flex min-h-11 items-center justify-center text-body-s font-bold text-ink-400"
      >
        Delete account
      </Link>
      <p className="text-center text-caption text-ink-400">Trybe v0.1 · prototype</p>
    </main>
  );
}
