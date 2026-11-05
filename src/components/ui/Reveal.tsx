"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  className?: string;
  // Stagger items in a row, in milliseconds.
  delay?: number;
};

// Fades its content up the first time it scrolls into view. Content is visible
// until the script runs, and anything already on screen stays put, so a slow
// phone never shows blank sections.
export default function Reveal({ children, className, delay = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"idle" | "waiting" | "shown">("idle");

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    // Already on screen: leave it alone.
    if (element.getBoundingClientRect().top < window.innerHeight) return;

    setState("waiting");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setState("shown");
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-reveal={state === "idle" ? undefined : state}
      className={["reveal", className].filter(Boolean).join(" ")}
      style={delay ? { animationDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
