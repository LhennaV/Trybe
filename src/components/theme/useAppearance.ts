"use client";

import { useSyncExternalStore } from "react";
import { APPEARANCE_CHANGE_EVENT, parseAppearance, readStoredAppearance } from "./appearance";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(APPEARANCE_CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(APPEARANCE_CHANGE_EVENT, onChange);
  };
}

// The saved theme choice, kept in sync across tabs and components.
// Renders the default on the server, then the stored value in the browser.
export function useAppearance() {
  const raw = useSyncExternalStore(subscribe, readStoredAppearance, () => null);
  return parseAppearance(raw);
}
