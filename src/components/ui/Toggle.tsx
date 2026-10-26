import type { ComponentProps } from "react";

type ToggleProps = Omit<ComponentProps<"button">, "onChange"> & {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
};

// On/off switch: 46x28 track, 22px knob. Give it a label with aria-label or
// aria-labelledby, since the switch itself has no text.
export default function Toggle({ checked, onCheckedChange, className, ...props }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={[
        // The ::before grows the 28px track to a 44px tap target.
        "relative h-7 w-[46px] shrink-0 rounded-chip transition-colors duration-200 ease-out before:absolute before:inset-x-0 before:-inset-y-2",
        checked ? "bg-brand-plum" : "bg-ink-400",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      <span
        aria-hidden
        className={[
          "absolute top-[3px] left-[3px] size-[22px] rounded-chip bg-surface-white transition-transform duration-200 ease-out motion-reduce:transition-none",
          checked ? "translate-x-[18px]" : "translate-x-0",
        ].join(" ")}
      />
    </button>
  );
}
