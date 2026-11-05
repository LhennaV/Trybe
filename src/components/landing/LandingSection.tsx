import type { ReactNode } from "react";
import Reveal from "@/components/ui/Reveal";

type LandingSectionProps = {
  id?: string;
  // Background and any padding overrides for the full-width band.
  className?: string;
  // Layout for the centered content column.
  innerClassName?: string;
  // Fade the content up when it scrolls into view. Off for the hero, which animates on load.
  reveal?: boolean;
  children: ReactNode;
};

// A full-width band with a centered column. At 1440px the side padding works
// out to the 120px in Figma; below that it shrinks to 40px, then 16px on phones.
export default function LandingSection({ id, className, innerClassName, reveal = true, children }: LandingSectionProps) {
  const columnClassName = ["mx-auto w-full max-w-[1280px] px-4 py-14 lg:px-10 lg:py-24", innerClassName]
    .filter(Boolean)
    .join(" ");

  return (
    <section id={id} className={className}>
      {reveal ? (
        <Reveal className={columnClassName}>{children}</Reveal>
      ) : (
        <div className={columnClassName}>{children}</div>
      )}
    </section>
  );
}
