"use client";

import { Fragment, useEffect, useRef, useState, type ElementType } from "react";

type RevealTextProps = {
  text: string;
  as?: ElementType;
  className?: string;
  // "load" plays on first paint (hero). "scroll" waits until it scrolls into view.
  trigger?: "load" | "scroll";
  // Before the first word starts, in milliseconds.
  delay?: number;
  // Between words, in milliseconds.
  stagger?: number;
};

// Heading whose words slide up out of a clip, one after another. Screen readers
// get the plain sentence. Like Reveal, scroll mode leaves text visible until the
// script has checked it's below the screen, so slow loads never show blank headings.
export default function RevealText({
  text,
  as: Tag = "h2",
  className,
  trigger = "scroll",
  delay = 0,
  stagger = 45,
}: RevealTextProps) {
  const ref = useRef<HTMLElement>(null);
  const [state, setState] = useState<"idle" | "waiting" | "shown">(trigger === "load" ? "shown" : "idle");

  useEffect(() => {
    if (trigger === "load") return;
    const element = ref.current;
    if (!element) return;
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
  }, [trigger]);

  const words = text.split(" ");

  return (
    <Tag
      ref={ref}
      data-reveal={state === "idle" ? undefined : state}
      className={["text-rise", className].filter(Boolean).join(" ")}
    >
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {words.map((word, index) => (
          <Fragment key={index}>
            <span className="text-rise-mask">
              <span className="text-rise-word" style={{ animationDelay: `${delay + index * stagger}ms` }}>
                {word}
              </span>
            </span>
            {index < words.length - 1 && " "}
          </Fragment>
        ))}
      </span>
    </Tag>
  );
}
