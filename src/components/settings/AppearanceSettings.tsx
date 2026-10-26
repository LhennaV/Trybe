"use client";

import { Camera, Check, CircleHalf } from "@phosphor-icons/react";
import { saveAppearance, type ThemeChoice } from "@/components/theme/appearance";
import { useAppearance } from "@/components/theme/useAppearance";
import Button from "@/components/ui/Button";
import Toggle from "@/components/ui/Toggle";

// A mini screen drawn with the theme's own tokens. data-theme on the wrapper
// makes it show that theme even when the rest of the app is in another one.
function Swatch({ theme, className = "" }: { theme: "light" | "dark"; className?: string }) {
  return (
    <div data-theme={theme} className={`flex flex-col gap-1.5 bg-brand-cream p-[7px] pt-[11px] ${className}`}>
      <span className="h-2 w-10 max-w-full rounded-[4px] bg-ink-900" />
      <span className="h-1.5 w-7 max-w-full rounded-[3px] bg-ink-900 opacity-50" />
      <span className="mt-2 h-3.5 w-14 max-w-full rounded-[7px] bg-brand-plum" />
    </div>
  );
}

const options: { value: ThemeChoice; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "auto", label: "Auto" },
];

export default function AppearanceSettings() {
  const appearance = useAppearance();

  return (
    <div className="flex flex-col gap-4">
      {/* Preview follows whatever is picked, since it uses the live tokens. */}
      <div className="flex flex-col gap-2.5 rounded-photo border-[1.5px] border-line bg-surface-white p-3.5">
        <p className="text-label-s uppercase text-ink-400">Preview</p>
        <div className="flex items-center gap-3">
          <span className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-brand-box-soft text-brand-box-dark/40">
            <Camera size={24} weight="bold" aria-hidden />
          </span>
          <div className="flex flex-col gap-[3px]">
            <p className="text-body-m font-bold text-ink-900">Shimpo Aspire wheel</p>
            <p className="text-caption text-ink-600">Good condition · Wheels &amp; kilns</p>
            <p className="text-caption font-bold text-brand-plum">Looking for: film camera</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button className="flex-1" tabIndex={-1} aria-hidden>
            Propose a trade
          </Button>
          <span className="rounded-chip border-[1.5px] border-line bg-surface-white px-3.5 py-2 text-body-s font-bold text-ink-600">
            Pottery
          </span>
        </div>
      </div>

      <h2 id="theme-label" className="text-label-s uppercase text-ink-600">
        Theme
      </h2>
      <div role="radiogroup" aria-labelledby="theme-label" className="flex gap-2.5">
        {options.map((option) => {
          const selected = appearance.theme === option.value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => saveAppearance({ ...appearance, theme: option.value })}
              className={[
                "flex flex-1 flex-col items-center gap-2 rounded-card bg-surface-white px-2 py-2.5",
                selected ? "border-[2.5px] border-brand-plum" : "border-[1.5px] border-line",
              ].join(" ")}
            >
              <span className="flex h-16 w-full max-w-[92px] overflow-hidden rounded-xl border border-line">
                {option.value === "auto" ? (
                  <>
                    <Swatch theme="light" className="flex-1" />
                    <Swatch theme="dark" className="flex-1" />
                  </>
                ) : (
                  <Swatch theme={option.value} className="flex-1" />
                )}
              </span>
              <span className="flex items-center gap-1.5">
                <span
                  aria-hidden
                  className={[
                    "flex size-5 items-center justify-center rounded-chip",
                    selected ? "bg-brand-plum text-surface-white" : "border-[1.5px] border-ink-400 bg-surface-white",
                  ].join(" ")}
                >
                  {selected && <Check size={12} weight="bold" />}
                </span>
                <span className={`text-body-s font-bold ${selected ? "text-brand-plum" : "text-ink-900"}`}>
                  {option.label}
                </span>
              </span>
            </button>
          );
        })}
      </div>
      <p className="text-caption text-ink-600">Auto follows your phone&apos;s light or dark setting.</p>

      <div className="flex items-center gap-3 rounded-card border-[1.5px] border-line bg-surface-white p-3.5">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-lavender-soft text-brand-plum">
          <CircleHalf size={20} weight="bold" aria-hidden />
        </span>
        <span className="flex flex-1 flex-col gap-0.5">
          <span id="hc-label" className="text-body-m font-bold text-ink-900">
            High contrast
          </span>
          <span className="text-caption text-ink-600">Darker text and stronger borders. Works with light or dark.</span>
        </span>
        <Toggle
          checked={appearance.highContrast === true}
          onCheckedChange={(on) => saveAppearance({ ...appearance, highContrast: on })}
          aria-labelledby="hc-label"
        />
      </div>
    </div>
  );
}
