import Image from "next/image";
import Link from "next/link";
import RevealText from "@/components/ui/RevealText";
import WaitlistForm from "./WaitlistForm";

// Instagram and Contact are in Figma but have no address yet. Add the href
// and they show up.
const LINKS: { label: string; href: string | null }[] = [
  { label: "Instagram", href: null },
  { label: "Contact", href: null },
  { label: "Privacy", href: "/privacy" },
];

// Rounded plum footer: the beta call to action, then the brand row and links,
// with a faded TRYBE watermark peeking out at the bottom.
export default function LandingFooter() {
  return (
    <footer className="relative isolate overflow-hidden rounded-t-[32px] bg-brand-plum text-surface-white">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col px-4 pt-14 pb-[30vw] lg:px-10 lg:pt-24 lg:pb-52">
        <div className="flex flex-col gap-5 border-b border-surface-white/15 pb-12 lg:flex-row lg:items-end lg:justify-between lg:gap-12 lg:pb-16">
          <div className="flex flex-col gap-3 lg:max-w-[640px] lg:gap-4">
            <RevealText
              text="Your next hobby might already be in someone's drawer."
              className="font-display text-display-section-m text-balance lg:text-display-cta"
            />
            <p className="text-body-s text-brand-lavender-soft lg:text-lead">
              Join the beta and be one of the first to trade on Trybe.
            </p>
          </div>
          <WaitlistForm onPlum className="lg:max-w-[460px]" />
        </div>

        <div className="flex flex-col items-center gap-3.5 pt-8 lg:flex-row lg:justify-between">
          <div className="flex flex-col items-center gap-3.5 lg:flex-row lg:gap-2.5">
            <span className="flex items-center gap-2 lg:gap-2.5">
              <Image src="/brand/storm-icon.png" alt="" width={33} height={32} className="h-7 w-auto lg:h-8" />
              <span className="font-display text-display-m">TRYBE</span>
            </span>
            {/* On phones the copyright line moves below the links. */}
            <span className="hidden text-body-s text-brand-lavender-soft lg:inline">
              © 2026 Trybe. Made with a lot of curiosity.
            </span>
          </div>

          <ul className="flex gap-6 lg:gap-7">
            {LINKS.filter((link) => link.href).map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href!}
                  className="flex min-h-11 items-center text-body-s font-bold focus-visible:outline-surface-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <p className="text-caption text-brand-lavender-soft lg:hidden">© 2026 Trybe. Made with a lot of curiosity.</p>
        </div>
      </div>

      <p
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -bottom-[0.2em] -z-10 text-center font-display text-[34vw] leading-none text-surface-white/10 select-none lg:text-[18rem]"
      >
        TRYBE
      </p>
    </footer>
  );
}
