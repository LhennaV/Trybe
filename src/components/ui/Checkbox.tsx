import { useId, type ComponentProps, type ReactNode } from "react";
import { Check } from "@phosphor-icons/react/dist/ssr";

type CheckboxProps = Omit<ComponentProps<"input">, "type"> & {
  label: ReactNode;
};

// 22px box with radius 7. Checked is plum with a white check. The whole row
// is the label, so the tap target is the full line, not just the box.
export default function Checkbox({ label, id, className, ...props }: CheckboxProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <label
      htmlFor={inputId}
      className={["flex min-h-11 cursor-pointer items-center gap-2.5", className].filter(Boolean).join(" ")}
    >
      <span className="relative flex size-[22px] shrink-0">
        <input
          id={inputId}
          type="checkbox"
          className="peer size-full cursor-pointer appearance-none rounded-[7px] border-[1.5px] border-line bg-surface-white checked:border-brand-plum checked:bg-brand-plum"
          {...props}
        />
        <Check
          size={14}
          weight="bold"
          aria-hidden
          className="pointer-events-none absolute inset-0 m-auto text-surface-white opacity-0 peer-checked:opacity-100"
        />
      </span>
      <span className="text-body-s text-ink-900">{label}</span>
    </label>
  );
}
