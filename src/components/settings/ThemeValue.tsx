"use client";

import { useAppearance } from "@/components/theme/useAppearance";

const labels = { light: "Light", dark: "Dark", auto: "Auto" };

// Current theme shown on the Settings row, e.g. "Dark · High contrast".
export default function ThemeValue() {
  const appearance = useAppearance();
  return (
    <>
      {labels[appearance.theme]}
      {appearance.highContrast && " · High contrast"}
    </>
  );
}
