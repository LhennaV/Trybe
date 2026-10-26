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
  SignOut,
  Tray,
  User,
} from "@phosphor-icons/react/dist/ssr";
import NotificationToggles from "@/components/settings/NotificationToggles";
import { SettingsGroup, SettingsLinkRow } from "@/components/settings/SettingsList";
import ThemeValue from "@/components/settings/ThemeValue";
import TopBar from "@/components/ui/TopBar";

export const metadata: Metadata = {
  title: "Settings",
};

// Settings layout (SET-01). Most rows lead to screens that come in later
// phases, so their links are placeholders for now. Values are sample data.
export default function SettingsPage() {
  const icon = { size: 18, weight: "bold" as const, "aria-hidden": true };

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-3.5 px-4 pt-2 pb-[max(24px,env(safe-area-inset-bottom))]">
      <TopBar title="Settings" backHref="/profile" />

      <SettingsGroup title="Account">
        <SettingsLinkRow icon={<User {...icon} />} label="Edit profile" href="/settings/profile" />
        <SettingsLinkRow icon={<BookmarkSimple {...icon} />} label="Saved" href="/saved" />
        <SettingsLinkRow icon={<EnvelopeSimple {...icon} />} label="Email" value="s•••@email.com" href="/settings" />
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
        {/* The default is an open decision (TRD section 21), so no value is shown yet. */}
        <SettingsLinkRow icon={<Tray {...icon} />} label="Who can message me" href="/settings" />
        <SettingsLinkRow icon={<Prohibit {...icon} />} label="Blocked users" value="2" href="/settings/blocked" />
        <SettingsLinkRow icon={<MapPin {...icon} />} label="Location shown" value="City only" href="/settings" />
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

      <button
        type="button"
        className="mt-1 flex min-h-11 items-center justify-center gap-2 rounded-card border-[1.5px] border-line bg-surface-white px-3.5 py-[13px] text-body-m font-bold text-status-danger"
      >
        <SignOut size={18} weight="bold" aria-hidden />
        Log out
      </button>
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
