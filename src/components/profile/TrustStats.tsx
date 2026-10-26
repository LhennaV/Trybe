import { Fragment } from "react";
import { Star } from "@phosphor-icons/react/dist/ssr";
import type { Profile } from "./sampleProfiles";

// Rating, trade count, and time on Trybe in one card. Ratings reduce risk,
// they don't guarantee it, so this stays factual and doesn't say "trusted".
export default function TrustStats({ profile }: { profile: Profile }) {
  const stats = [
    { label: "avg rating", value: profile.reviewCount > 0 ? profile.rating.toFixed(1) : "New", star: profile.reviewCount > 0 },
    { label: "trades", value: String(profile.tradeCount), star: false },
    { label: "on Trybe", value: profile.timeOnTrybe, star: false },
  ];

  return (
    <dl className="flex items-center rounded-card border-[1.5px] border-line bg-surface-white py-3">
      {stats.map((stat, index) => (
        <Fragment key={stat.label}>
          {index > 0 && <span className="h-9 w-[1.5px] bg-line" aria-hidden />}
          <div className="flex flex-1 flex-col-reverse items-center gap-0.5">
            <dt className="text-caption text-ink-600">{stat.label}</dt>
            <dd className="flex items-center gap-1 font-display text-display-m text-brand-plum">
              {stat.star && <Star size={18} weight="fill" className="text-brand-box" aria-hidden />}
              {stat.value}
            </dd>
          </div>
        </Fragment>
      ))}
    </dl>
  );
}
