import RevealText from "@/components/ui/RevealText";
import CursorReveal from "./CursorReveal";
import SwapExample from "./SwapExample";
import WaitlistForm from "./WaitlistForm";

// Each block fades up on load, one after another. The headline's words take
// slot 1 and rise on their own.
const step = (index: number) => ({ animationDelay: `${index * 90}ms` });

export default function LandingHero() {
  return (
    <section className="relative isolate overflow-hidden">
      <CursorReveal />
      <div className="mx-auto flex w-full max-w-[1280px] flex-col items-center gap-4 px-4 pt-6 pb-12 text-center lg:gap-[18px] lg:px-10 lg:pt-16 lg:pb-[88px]">
        <p style={step(0)} className="animate-fade-up font-display text-title-m font-normal text-balance text-brand-plum lg:text-display-m">
          Curiosity killed the cat. Trybe brought it back.
        </p>
        <RevealText
          as="h1"
          trigger="load"
          delay={90}
          text="Try a new hobby without buying new gear."
          className="font-display text-display-hero-m text-balance text-ink-900 lg:max-w-[820px] lg:text-display-hero"
        />
        <p style={step(4)} className="animate-fade-up text-lead-m text-balance text-ink-600 lg:max-w-[600px] lg:text-lead-l">
          Trade the stuff from hobbies you&apos;ve moved on from for the starter gear you actually want. No checkout,
          no gamble.
        </p>
        <div style={step(5)} className="flex w-full animate-fade-up justify-center">
          <WaitlistForm id="join" className="text-left lg:max-w-[460px]" />
        </div>
        <div style={step(6)} className="w-full animate-fade-up">
          <SwapExample />
        </div>
      </div>
    </section>
  );
}
