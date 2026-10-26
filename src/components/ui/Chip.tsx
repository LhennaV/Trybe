import type { ComponentProps } from "react";

type ChipProps = ComponentProps<"button"> & {
  selected?: boolean;
};

export default function Chip({
  selected = false,
  type = "button",
  className,
  ...props
}: ChipProps) {
  return (
    <button
      type={type}
      aria-pressed={selected}
      className={[
        // The chip is 34px tall, so the ::before extends the tap target to 44px.
        "relative rounded-chip border-[1.5px] px-3.5 py-2 text-body-s font-bold",
        "before:absolute before:inset-x-0 before:-inset-y-1.5",
        selected
          ? "border-brand-plum bg-brand-plum text-surface-white"
          : "border-line bg-surface-white text-ink-600",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}
