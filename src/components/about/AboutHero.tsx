import Image from "next/image";
import LandingSection from "@/components/landing/LandingSection";
import SectionLabel from "@/components/landing/SectionLabel";
import Tilt from "@/components/ui/Tilt";
import { BRAND, brandSize } from "@/shared/brand";

// Top of /about: what Trybe is for, next to the first logo sketch and the
// logo it became.
export default function AboutHero() {
  return (
    <LandingSection
      reveal={false}
      innerClassName="flex flex-col gap-10 pt-8 lg:flex-row lg:items-center lg:justify-between lg:gap-16 lg:pt-16"
    >
      <div className="flex animate-fade-up flex-col gap-4 lg:max-w-[600px] lg:gap-5">
        <SectionLabel>About Trybe</SectionLabel>
        <h1 className="font-display text-display-hero-m text-balance text-ink-900 lg:text-display-hero">
          It started with gear sitting in a drawer.
        </h1>
        <p className="text-lead-m text-ink-600 lg:text-lead-l">
          People pick up a hobby, buy the gear, then move on. The tools sit unused and lose value, and trying
          something new means buying everything fresh, with no promise it&apos;ll stick.
        </p>
        <p className="text-lead-m text-ink-600 lg:text-lead-l">
          Trybe lets you swap what you don&apos;t use anymore for what you need next.
        </p>
      </div>

      {/* The pencil sketch, taped down, with the finished logo stamped over its corner. */}
      <div className="relative mx-auto w-full max-w-[380px] shrink-0 animate-fade-up [animation-delay:150ms] lg:mx-0 lg:max-w-[440px]">
        <figure className="-rotate-2">
          <Tilt max={5} className="rounded-card bg-surface-white p-3 pb-2 shadow-dropdown">
          <Image
            src="/about/logo-sketch.jpg"
            alt="Pencil sketch of a cat peeking out of a cardboard box marked with a T and a paw print"
            width={760}
            height={600}
            sizes="(min-width: 1024px) 440px, 380px"
            className="h-auto w-full rounded-input"
            priority
          />
          <figcaption className="px-1 pt-2 text-caption text-ink-600">The very first Trybe sketch</figcaption>
          </Tilt>
        </figure>
        <span
          aria-hidden
          className="absolute -top-3 left-1/2 h-6 w-24 -translate-x-1/2 rotate-3 rounded-sm bg-brand-box/60"
        />
        <div className="absolute -right-2 -bottom-8 rotate-6 rounded-card bg-brand-lavender p-3 shadow-dropdown lg:-right-8">
          <Image {...BRAND.icon} {...brandSize(BRAND.icon, 80)} alt="The finished Trybe logo" className="size-16 lg:size-20" />
        </div>
      </div>
    </LandingSection>
  );
}
