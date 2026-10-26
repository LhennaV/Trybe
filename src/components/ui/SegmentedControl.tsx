"use client";

type SegmentedControlProps<T extends string> = {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
};

// Pick one of a few options in a single row (e.g. item condition).
export default function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <div role="radiogroup" aria-label={label} className="flex gap-1 rounded-xl bg-line p-1">
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={[
              "min-h-9 flex-1 rounded-[9px] py-2 text-body-s font-bold",
              selected ? "bg-surface-white text-brand-plum" : "text-ink-600",
            ].join(" ")}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
