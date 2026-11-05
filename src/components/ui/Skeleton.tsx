import type { CSSProperties } from "react";

type SkeletonProps = {
  className?: string;
  // For one-off sizes, like chips of different widths.
  style?: CSSProperties;
  // line: text and chips. photo: photo boxes. cover: profile covers.
  tone?: "line" | "photo" | "cover";
};

const TONES = {
  line: "bg-line",
  photo: "bg-brand-box-soft",
  cover: "bg-brand-lavender",
};

// One block that gently pulses while content loads. Set the size and radius
// (rounded-chip for text lines) with className. The pulse stops with reduced motion.
export default function Skeleton({ className, style, tone = "line" }: SkeletonProps) {
  return (
    <span
      aria-hidden
      style={style}
      className={["block shrink-0 animate-shimmer", TONES[tone], className].filter(Boolean).join(" ")}
    />
  );
}
