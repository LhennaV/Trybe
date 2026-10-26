import type { ComponentProps } from "react";

// White card with a 1.5px line border. Cards use a border, not a shadow.
export default function Card({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={["rounded-card border-[1.5px] border-line bg-surface-white p-4", className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}
