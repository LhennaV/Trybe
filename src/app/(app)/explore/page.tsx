import type { Metadata } from "next";
import Link from "next/link";
import { Camera } from "@phosphor-icons/react/dist/ssr";
import { HOBBY_TILES, STARTER_KITS, type HobbyTile } from "@/components/explore/exploreData";
import FeedSearch from "@/components/feed/FeedSearch";

export const metadata: Metadata = {
  title: "Explore",
  description: "Browse hobby gear up for trade near you, by hobby.",
};

// Tile colors. Titles use ink-900 on the lighter tiles where the Figma
// accent color didn't reach 4.5:1 contrast.
const TONES: Record<HobbyTile["tone"], string> = {
  box: "bg-brand-box-soft text-ink-900",
  lavender: "bg-brand-lavender-soft text-brand-plum",
  blush: "bg-brand-blush/60 text-ink-900",
  success: "bg-status-success-soft text-status-success",
  warning: "bg-status-warning-soft text-status-warning",
};

// Explore (EXP-01). "Wanted near you" from the Figma is left out while
// Wanted posts are an open decision.
export default function ExplorePage() {
  return (
    <div className="flex flex-col gap-[18px]">
      <h1 className="font-display text-display-l text-brand-plum">Explore</h1>
      <FeedSearch placeholder={'Try "film camera" or "loom"'} />

      <section className="flex flex-col gap-3">
        <h2 className="text-title-m text-ink-900">Try something new</h2>
        <ul className="grid grid-cols-2 gap-3">
          {HOBBY_TILES.map((tile) => (
            <li key={tile.name}>
              <Link
                href={`/search?hobby=${encodeURIComponent(tile.hobby)}`}
                className={`flex h-[92px] flex-col justify-end gap-0.5 rounded-photo p-3.5 ${TONES[tile.tone]}`}
              >
                <span className="font-display text-display-m">{tile.name}</span>
                <span className="text-caption text-ink-600">{tile.count}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-title-m text-ink-900">Starter kits near you</h2>
        <ul className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
          {STARTER_KITS.map((kit) => (
            <li key={kit.id} className="flex w-40 shrink-0 flex-col gap-2">
              <div className="relative flex h-[120px] items-center justify-center rounded-card bg-brand-box-soft text-brand-box-dark/40">
                <Camera size={28} weight="bold" aria-hidden />
                <span className="absolute top-2 left-2 rounded-chip bg-surface-white px-2 py-1 text-caption font-extrabold text-brand-plum">
                  {kit.toolCount} tools
                </span>
              </div>
              <p className="text-body-s font-bold text-ink-900">{kit.title}</p>
              <p className="text-caption text-ink-600">@{kit.authorHandle}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
