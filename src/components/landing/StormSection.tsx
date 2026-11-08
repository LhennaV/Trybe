import Image from "next/image";
import Link from "next/link";
import Tilt from "@/components/ui/Tilt";
import LandingSection from "./LandingSection";

// Figma "Landing · A · Curiosity" > Storm. Links to /about for the full story.
export default function StormSection() {
  return (
    <LandingSection>
      <div className="reveal-item">
        <Tilt
          max={3}
          className="flex flex-col items-center gap-6 rounded-[28px] bg-brand-lavender p-7 text-center lg:flex-row lg:gap-14 lg:p-14 lg:text-left"
        >
          <Image
            src="/brand/storm-icon.png"
            alt="Storm, the Trybe cat, peeking out of a cardboard box"
            width={220}
            height={215}
            className="h-auto w-40 shrink-0 animate-float lg:w-[220px]"
          />
          <div className="flex flex-col gap-3">
            <p className="text-label-s tracking-[0.08em] text-brand-plum-dark uppercase">Meet Storm</p>
            <h2 className="font-display text-display-section-m text-brand-plum-dark lg:text-display-section">
              The cat in the box is real.
            </h2>
            <p className="text-body-m text-brand-plum-dark lg:text-lead">
              Storm (or Stormi, or Inyormi) is our designer&apos;s real cat, and she&apos;s the one peeking out of our
              logo. You know the saying: curiosity killed the cat. The part people forget is that satisfaction brought
              it back. That&apos;s Trybe. Try the thing, and if it&apos;s not for you, pass it on to the next curious
              person.
            </p>
            <Link
              href="/about"
              className="flex min-h-11 items-center self-center text-body-m font-extrabold text-brand-plum-dark underline underline-offset-4 lg:self-start"
            >
              Read how Trybe started
            </Link>
          </div>
        </Tilt>
      </div>
    </LandingSection>
  );
}
