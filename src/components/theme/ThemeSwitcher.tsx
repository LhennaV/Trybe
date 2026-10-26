"use client";

import { useSyncExternalStore } from "react";
import Chip from "@/components/ui/Chip";
import {
  APPEARANCE_CHANGE_EVENT,
  parseAppearance,
  readStoredAppearance,
  saveAppearance,
  type ThemeChoice,
} from "./appearance";

const themeOptions: { value: ThemeChoice; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "auto", label: "Auto" },
];

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(APPEARANCE_CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(APPEARANCE_CHANGE_EVENT, onChange);
  };
}

export default function ThemeSwitcher() {
  const raw = useSyncExternalStore(subscribe, readStoredAppearance, () => null);
  const appearance = parseAppearance(raw);

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
