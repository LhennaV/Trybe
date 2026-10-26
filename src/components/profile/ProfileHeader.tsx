import type { ReactNode } from "react";
import { EnvelopeSimple, MapPin } from "@phosphor-icons/react/dist/ssr";
import LevelBadge from "@/components/badges/LevelBadge";
import Avatar from "@/components/ui/Avatar";
import type { Profile } from "./sampleProfiles";

type ProfileHeaderProps = {
  profile: Profile;
  // Icon buttons on the cover (back, share, settings, report...).
  coverActions: ReactNode;
  // Buttons next to the avatar (Edit profile, Message...).
  actions: ReactNode;
  coverHeight?: number;
};

// Lavender cover, avatar overlapping it, name, handle and city (PROF-02).
// Location is only ever the city (PROF-05).
export default function ProfileHeader({ profile, coverActions, actions, coverHeight = 130 }: ProfileHeaderProps) {
  return (
    <>
      {/* Full-bleed on mobile; a rounded banner on desktop. */}
      <div
        className="relative h-[var(--cover-h)] w-full bg-brand-lavender lg:h-[160px] lg:rounded-[24px]"
        style={{ "--cover-h": `${coverHeight}px` } as React.CSSProperties}
      >
        <div className="absolute inset-x-4 top-[max(8px,env(safe-area-inset-top))] flex gap-2 lg:top-4">{coverActions}</div>
      </div>

      <div className="flex flex-col gap-3 px-4 lg:px-6">
        <div className="-mt-[42px] flex items-end gap-3">
          <Avatar name={profile.displayName} size={84} className="ring-4 ring-brand-cream" />
          <div className="ml-auto flex gap-2">{actions}</div>
        </div>

        <div className="flex flex-col gap-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-display-m text-ink-900">{profile.displayName}</h1>
            {/* Trader level, which also covers the "new trader" badge (PROF-04). */}
            <LevelBadge completedTrades={profile.completedTrades} />
          </div>
          <p className="flex flex-wrap items-center gap-1.5 text-body-s text-ink-600">
            <span className="font-bold">@{profile.handle}</span>
            <span className="text-ink-400" aria-hidden>
              ·
            </span>
            <MapPin size={13} weight="bold" aria-hidden />
            {profile.city}
          </p>
        </div>

        {profile.bio && <p className="text-body-s text-ink-900">{profile.bio}</p>}

        {/* Report counts are never shown here (PROF-07). */}
        {profile.emailVerified && (
          <p className="flex items-center gap-1 text-caption text-ink-600">
            <EnvelopeSimple size={14} weight="bold" className="text-status-success" aria-hidden />
            Email verified
          </p>
        )}
      </div>
    </>
  );
}
