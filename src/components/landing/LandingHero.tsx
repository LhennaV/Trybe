import { Sparkle } from "@phosphor-icons/react/dist/ssr";
import LandingSection from "./LandingSection";
import SwapExample from "./SwapExample";
import WaitlistForm from "./WaitlistForm";

// Each line fades up on load, one after another.
const step = (index: number) => ({ animationDelay: `${index * 70}ms` });

export default function LandingHero() {
  return (
    <LandingSection
      reveal={false}
      innerClassName="flex flex-col items-center gap-4 pt-6 pb-12 text-center lg:gap-[18px] lg:pt-16 lg:pb-[88px]"
    >
      <p
        style={step(0)}
        className="flex animate-fade-up items-center gap-1.5 rounded-chip bg-brand-lavender-soft px-3 py-1.5 text-label-s text-brand-plum"
      >
        <Sparkle size={14} weight="bold" aria-hidden />
        Looking for beta testers
      </p>
      <p style={step(1)} className="animate-fade-up font-display text-title-m font-normal text-balance text-brand-plum lg:text-display-m">
        Curiosity killed the cat. Trybe brought it back.
      </p>
      <h1
        style={step(2)}
        className="animate-fade-up font-display text-display-hero-m text-balance text-ink-900 lg:max-w-[820px] lg:text-display-hero"
      >
        Try a new hobby without buying new gear.
      </h1>
      <p style={step(3)} className="animate-fade-up text-lead-m text-balance text-ink-600 lg:max-w-[600px] lg:text-lead-l">
        Trade the stuff from hobbies you&apos;ve moved on from for the starter gear you actually want. No checkout,
        no gamble.
      </p>
      <div style={step(4)} className="flex w-full animate-fade-up justify-center">
        <WaitlistForm id="join" className="text-left lg:max-w-[460px]" />
      </div>
      <div style={step(5)} className="w-full animate-fade-up">
        <SwapExample />
      </div>
    </LandingSection>
  );
}
