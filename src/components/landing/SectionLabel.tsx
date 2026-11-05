import type { ReactNode } from "react";

// Small caps label above each landing section title ("HOW IT WORKS").
export default function SectionLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={["text-label-s tracking-[0.08em] uppercase", className ?? "text-brand-plum"].join(" ")}>
      {children}
    </p>
  );
}
