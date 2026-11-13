"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { BRAND, brandSize } from "@/shared/brand";

// Sections of the landing page. "/#..." so they also work from /about and
// the legal pages. About lives in the footer.
const LINKS = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#safety", label: "Safety" },
  { href: "/#badges", label: "Badges" },
  { href: "/#faq", label: "FAQ" },
];

// Index of the landing section on screen, or -1 (top of the page, or not on
// the landing page). A section counts once its top passes 40% of the screen;
// at the very bottom the last one wins, since FAQ may be too short to get there.
function useActiveSection(enabled: boolean) {
  const [active, setActive] = useState(-1);

  useEffect(() => {
    if (!enabled) return;
    const sections = LINKS.map((link) => document.getElementById(link.href.split("#")[1]));
    let frame = 0;
    const update = () => {
      frame = 0;
      const line = window.innerHeight * 0.4;
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      let index = -1;
      sections.forEach((section, i) => {
        if (section && section.getBoundingClientRect().top <= line) index = i;
      });
      if (atBottom && sections[sections.length - 1]) index = sections.length - 1;
      setActive(index);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [enabled]);

  return enabled ? active : -1;
}

// Floating frosted-glass pill, after the HomeSure navbar: it sits on the page
// with the content scrolling underneath, blurred. One highlight slides behind
// the links, resting on the section you're reading and following hover and focus.
export default function LandingNav() {
  const pathname = usePathname();
  const linksRef = useRef<HTMLUListElement>(null);
  const restingIndex = useActiveSection(pathname === "/");
  const [target, setTarget] = useState(restingIndex);
  // While the pointer or focus is on a link, the highlight follows that link.
  const pointing = useRef(false);

  useEffect(() => {
    if (!pointing.current) setTarget(restingIndex);
  }, [restingIndex]);

  const point = (index: number) => {
    pointing.current = true;
    setTarget(index);
  };
  const rest = () => {
    pointing.current = false;
    setTarget(restingIndex);
  };
  const [pill, setPill] = useState<{ x: number; width: number } | null>(null);
  // No slide on first paint, or it would sweep in from the left.
  const [animate, setAnimate] = useState(false);

  const place = useCallback(() => {
    const anchors = linksRef.current?.querySelectorAll<HTMLAnchorElement>("a");
    const anchor = target >= 0 ? anchors?.[target] : undefined;
    setPill(anchor ? { x: anchor.offsetLeft, width: anchor.offsetWidth } : null);
  }, [target]);

  useLayoutEffect(place, [place]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setAnimate(true));
    const list = linksRef.current;
    const observer = list ? new ResizeObserver(place) : null;
    if (list) observer?.observe(list);
    document.fonts?.ready.then(place);
    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
    };
  }, [place]);

  return (
    <>
      <header
        className={[
          "fixed inset-x-0 top-2 z-50 mx-auto flex h-[54px] w-[calc(100%-16px)] max-w-[1180px] items-center justify-between gap-3 rounded-chip pr-2 pl-3.5",
          "sm:top-3.5 sm:h-[58px] sm:w-[calc(100%-28px)] sm:pl-5",
          // The glass: see-through surface, blur and a little saturation, a lit
          // top edge, and a soft shadow so it floats above the page.
          "border border-ink-900/[0.07] bg-surface-white/60 backdrop-blur-[16px] backdrop-saturate-[1.6]",
          "shadow-[inset_0_1px_0_var(--surface-white),0_8px_28px_color-mix(in_oklab,var(--ink-900)_10%,transparent)]",
          "motion-reduce:bg-surface-white/95 motion-reduce:backdrop-blur-none",
        ].join(" ")}
      >
        <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="Trybe home">
          <Image {...BRAND.icon} {...brandSize(BRAND.icon, 40)} alt="" priority className="h-8 w-auto" />
          <span className="font-display text-display-m text-brand-plum">TRYBE</span>
        </Link>

        <nav aria-label="Main" className="hidden lg:block">
          <ul ref={linksRef} className="relative flex items-center gap-1" onMouseLeave={rest}>
            <span
              aria-hidden
              className={[
                "pointer-events-none absolute top-1/2 left-0 h-9 -translate-y-1/2 rounded-chip bg-brand-lavender-soft shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--brand-plum)_25%,transparent)]",
                animate ? "transition-[translate,width,opacity] duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)]" : "",
                "motion-reduce:transition-opacity",
              ].join(" ")}
              style={{
                width: pill?.width ?? 0,
                translate: `${pill?.x ?? 0}px -50%`,
                opacity: pill ? 1 : 0,
              }}
            />
            {LINKS.map((link, index) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={index === restingIndex ? "location" : undefined}
                  onMouseEnter={() => point(index)}
                  onFocus={() => point(index)}
                  onBlur={rest}
                  className={[
                    "relative flex min-h-11 items-center rounded-chip px-3.5 text-body-s font-bold transition-colors duration-300",
                    index === target ? "text-brand-plum" : "text-ink-600",
                  ].join(" ")}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <Link
            href="/login"
            // Same 3px bottom edge as Sign up (in the line color) so both sit level.
            className="flex h-11 items-center rounded-chip border-[1.5px] border-line bg-surface-white px-3.5 text-body-s font-bold text-ink-900 shadow-[0_3px_0_0_var(--line)] sm:px-5"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="flex h-11 items-center rounded-chip bg-brand-plum px-3.5 text-body-s font-bold text-surface-white shadow-button sm:px-5"
          >
            Sign up
          </Link>
        </div>
      </header>
      {/* The bar floats, so hold its space at the top of the page. */}
      <div aria-hidden className="h-[70px] sm:h-[86px]" />
    </>
  );
}
