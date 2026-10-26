import Link from "next/link";
import { ArrowsLeftRight, CaretRight } from "@phosphor-icons/react/dist/ssr";

type MatchBannerProps = {
  title: string;
  subtitle: string;
  href: string;
};

// Nudge toward trades that match a hobby the user wants to try.
export default function MatchBanner({ title, subtitle, href }: MatchBannerProps) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-card bg-brand-lavender-soft px-3.5 py-3 lg:gap-4 lg:px-[18px] lg:py-3.5"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-plum text-surface-white lg:size-10">
        <ArrowsLeftRight size={18} weight="bold" aria-hidden />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-body-s font-bold text-brand-plum-dark lg:text-body-m">{title}</span>
        <span className="text-caption text-ink-600">{subtitle}</span>
      </span>
      <CaretRight size={18} weight="bold" className="shrink-0 text-brand-plum lg:hidden" aria-hidden />
      <span className="hidden shrink-0 pr-6 text-body-m font-bold text-brand-plum lg:block">See matches</span>
    </Link>
  );
}
