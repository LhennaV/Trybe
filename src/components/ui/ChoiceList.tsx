"use client";

import { Check } from "@phosphor-icons/react";

type ChoiceListProps<T extends string> = {
  label: string;
  options: { value: T; title: string; description?: string }[];
  value: T | null;
  onChange: (value: T) => void;
  // "cards": separate bordered cards (meetup spots). "list": rows in one card (outcomes).
  look?: "cards" | "list";
};

// Single choice shown as tappable rows with a round check (22px radio).
export default function ChoiceList<T extends string>({
  label,
  options,
  value,
  onChange,
  look = "cards",
}: ChoiceListProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={
        look === "list"
          ? "flex flex-col overflow-hidden rounded-card border-[1.5px] border-line bg-surface-white [&>*+*]:border-t [&>*+*]:border-line"
          : "flex flex-col gap-2.5"
      }
    >
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
              "flex min-h-11 w-full items-center gap-3 text-left",
              look === "list"
                ? `px-3.5 py-[13px] ${selected ? "bg-brand-lavender-soft" : ""}`
                : `rounded-input bg-surface-white px-3 py-2.5 ${
                    selected ? "border-2 border-brand-plum" : "border-[1.5px] border-line"
                  }`,
            ].join(" ")}
          >
            <span className="flex min-w-0 flex-1 flex-col gap-px">
              <span
                className={`text-body-s ${
                  look === "list" && selected ? "font-bold text-brand-plum" : look === "cards" ? "font-bold text-ink-900" : "text-ink-900"
                }`}
              >
                {option.title}
              </span>
              {option.description && <span className="text-caption text-ink-600">{option.description}</span>}
            </span>
            <span
              aria-hidden
              className={`flex size-[22px] shrink-0 items-center justify-center rounded-chip ${
                selected ? "bg-brand-plum text-surface-white" : "border-[1.5px] border-ink-400 bg-surface-white"
              }`}
            >
              {selected && <Check size={13} weight="bold" />}
            </span>
          </button>
        );
      })}
    </div>
  );
}
