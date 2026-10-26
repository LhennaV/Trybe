"use client";

import Chip from "@/components/ui/Chip";
import { saveAppearance, type ThemeChoice } from "./appearance";
import { useAppearance } from "./useAppearance";

const themeOptions: { value: ThemeChoice; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "auto", label: "Auto" },
];

// Compact switcher for the component preview page. The real one lives in
// Settings › Appearance.
export default function ThemeSwitcher() {
  const appearance = useAppearance();

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Theme">
        {themeOptions.map((option) => (
          <Chip
            key={option.value}
            selected={appearance.theme === option.value}
            onClick={() => saveAppearance({ ...appearance, theme: option.value })}
          >
            {option.label}
          </Chip>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <Chip
          selected={appearance.highContrast === true}
          onClick={() =>
            saveAppearance({ ...appearance, highContrast: appearance.highContrast !== true })
          }
        >
          High contrast
        </Chip>
      </div>
    </div>
  );
}
