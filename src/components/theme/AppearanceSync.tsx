"use client";

import { useLayoutEffect } from "react";
import { applyAppearance, parseAppearance, readStoredAppearance } from "./appearance";

// The inline script in layout.tsx sets the theme on first load. This keeps it
// set after React's dev remount clears it, and follows OS changes for "auto".
export default function AppearanceSync() {
  useLayoutEffect(() => {
    const sync = () => applyAppearance(parseAppearance(readStoredAppearance()));
    sync();

    const queries = [
      matchMedia("(prefers-color-scheme: dark)"),
      matchMedia("(prefers-contrast: more)"),
    ];
    queries.forEach((query) => query.addEventListener("change", sync));
    return () => queries.forEach((query) => query.removeEventListener("change", sync));
  }, []);

  return null;
}
