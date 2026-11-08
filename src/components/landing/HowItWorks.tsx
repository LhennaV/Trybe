import type { CSSProperties } from "react";
import { ArrowsLeftRight, Camera, MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";
import RevealText from "@/components/ui/RevealText";
import Tilt from "@/components/ui/Tilt";
import LandingSection from "./LandingSection";
import SectionLabel from "./SectionLabel";

const STEPS = [
  {
    icon: Camera,
    title: "Post what you're done with",
    body: "Snap a few photos, pick the hobby, and say what you'd like in return.",
  },
  {
    icon: MagnifyingGlass,
    title: "Find what you want to try",
    body: "Browse the feed by hobby and save the gear that makes you curious.",
  },
  {
    icon: ArrowsLeftRight,
    title: "Make an offer and meet up",
    body: "Swap item for item, add cash if it's not quite even, and trade in person.",
  },
];

export default function HowItWorks() {
  return (
    <LandingSection id="how-it-works" innerClassName="flex flex-col gap-3.5 lg:gap-10">
      <div className="flex flex-col gap-3.5 lg:gap-3">
        <SectionLabel>How it works</SectionLabel>
        <RevealText
          text="Three steps from drawer to new hobby."
          className="font-display text-display-section-m text-ink-900 lg:max-w-[760px] lg:text-display-section"
        />
      </div>

      <ol className="flex flex-col gap-3.5 lg:grid lg:grid-cols-3 lg:gap-6">
        {STEPS.map(({ icon: Icon, title, body }, index) => (
          // Cards rise in one after another, then lean toward the mouse.
          <li key={title} className="reveal-item" style={{ "--i": index } as CSSProperties}>
            <Tilt
              max={6}
              className="card-lift flex h-full flex-col gap-2.5 rounded-[20px] border-[1.5px] border-line bg-surface-white p-5 lg:gap-3.5 lg:rounded-3xl lg:p-7"
            >
              {/* Number and icon side by side, as in Figma. */}
              <div className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-xl bg-brand-plum text-title-m text-surface-white lg:size-11 lg:rounded-[14px] lg:font-display lg:text-display-m lg:font-normal">
                  {index + 1}
                </span>
                <Icon size={24} weight="bold" aria-hidden className="text-brand-plum" />
              </div>
              <h3 className="text-title-m text-ink-900 lg:font-display lg:text-display-m lg:font-normal">{title}</h3>
              <p className="text-body-s text-ink-600 lg:text-body-m">{body}</p>
            </Tilt>
          </li>
        ))}
      </ol>
    </LandingSection>
  );
}
