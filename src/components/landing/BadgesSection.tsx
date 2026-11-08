import type { CSSProperties } from "react";
import LevelBadge from "@/components/badges/LevelBadge";
import { TRADER_LEVELS } from "@/components/badges/levels";
import SpecialBadge from "@/components/badges/SpecialBadge";
import { getSpecialBadge, type SpecialBadgeId } from "@/components/badges/specialBadges";
import Tilt from "@/components/ui/Tilt";
import LandingSection from "./LandingSection";

const EARLY_BADGES: SpecialBadgeId[] = ["og-box-cat", "first-litter"];

function tradesLabel(minTrades: number) {
  if (minTrades === 0) return "New to Trybe";
  return `${minTrades} ${minTrades === 1 ? "trade" : "trades"}`;
}

// Figma "Landing · A · Curiosity" > Badges. Uses the real badge components and
// thresholds from src/components/badges, so this never drifts from the app.
export default function BadgesSection() {
  return (
    <LandingSection id="badges" className="bg-surface-white" innerClassName="grid gap-4 lg:grid-cols-2 lg:gap-6">
      <div className="reveal-item">
        <Tilt max={4} className="flex h-full flex-col gap-3 rounded-3xl bg-brand-cream p-6 lg:p-9">
          <p className="text-label-s tracking-[0.08em] text-brand-plum uppercase">Trust you can see</p>
          <h2 className="font-display text-display-l text-ink-900 lg:text-[32px] lg:leading-[38px]">
            Every trade levels you up.
          </h2>
          <p className="text-body-m text-ink-600">
            Badges show how many trades someone has finished, so you know who you&apos;re meeting. They only ever go
            up.
          </p>
          <ol className="flex flex-col gap-2.5 pt-2">
            {TRADER_LEVELS.map((level, index) => (
              <li
                key={level.name}
                className="reveal-item flex items-center gap-3"
                style={{ "--i": 2 + index * 0.6 } as CSSProperties}
              >
                <LevelBadge completedTrades={level.minTrades} />
                <span className="text-body-s text-ink-600">{tradesLabel(level.minTrades)}</span>
              </li>
            ))}
          </ol>
        </Tilt>
      </div>

      <div className="reveal-item" style={{ "--i": 1 } as CSSProperties}>
        <Tilt
          max={4}
          className="flex h-full flex-col gap-3 rounded-3xl bg-brand-plum p-6 text-surface-white lg:p-9"
        >
          <p className="text-label-s tracking-[0.08em] text-brand-lavender-soft uppercase">Only for early testers</p>
          <h2 className="font-display text-display-l lg:text-[32px] lg:leading-[38px]">Badges you can&apos;t get later.</h2>
          <p className="text-body-m text-brand-lavender-soft">
            Help us test Trybe and keep a badge that closes for good once we launch.
          </p>
          <ul className="flex flex-col gap-3 pt-2">
            {EARLY_BADGES.map((id) => {
              const badge = getSpecialBadge(id);
              return (
                <li key={id} className="flex flex-col gap-2 rounded-card bg-surface-white p-4 text-ink-900">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <SpecialBadge badge={id} />
                    <span className="text-body-s font-bold">{badge.audience}</span>
                  </div>
                  <p className="text-body-s text-ink-600">{badge.meaning}</p>
                </li>
              );
            })}
          </ul>
        </Tilt>
      </div>
    </LandingSection>
  );
}
