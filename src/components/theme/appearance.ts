export type ThemeChoice = "light" | "dark" | "auto";

export type Appearance = {
  theme: ThemeChoice;
  // null follows the OS (prefers-contrast: more).
  highContrast: boolean | null;
};

export const APPEARANCE_STORAGE_KEY = "trybe-appearance";
export const APPEARANCE_CHANGE_EVENT = "trybe-appearance-change";

// Dark mode is still an open decision (see AGENTS.md), so default to light
// instead of following the OS until it's confirmed.
export const DEFAULT_APPEARANCE: Appearance = { theme: "light", highContrast: null };

export function parseAppearance(raw: string | null): Appearance {
  if (!raw) return DEFAULT_APPEARANCE;
  try {
    const value = JSON.parse(raw) as Partial<Appearance>;
    const theme =
      value.theme === "light" || value.theme === "dark" || value.theme === "auto"
        ? value.theme
        : DEFAULT_APPEARANCE.theme;
    const highContrast = typeof value.highContrast === "boolean" ? value.highContrast : null;
    return { theme, highContrast };
  } catch {
    return DEFAULT_APPEARANCE;
  }
}

export function readStoredAppearance(): string | null {
  try {
    return localStorage.getItem(APPEARANCE_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function applyAppearance(appearance: Appearance) {
  const root = document.documentElement;
  const dark =
    appearance.theme === "dark" ||
    (appearance.theme === "auto" && matchMedia("(prefers-color-scheme: dark)").matches);
  const highContrast =
    appearance.highContrast ?? matchMedia("(prefers-contrast: more)").matches;

  root.setAttribute("data-theme", dark ? "dark" : "light");
  if (highContrast) root.setAttribute("data-contrast", "high");
  else root.removeAttribute("data-contrast");
}

export function saveAppearance(appearance: Appearance) {
  try {
    localStorage.setItem(APPEARANCE_STORAGE_KEY, JSON.stringify(appearance));
  } catch {
    // Storage can be blocked (private mode). The choice still applies for this visit.
  }
  applyAppearance(appearance);
  window.dispatchEvent(new Event(APPEARANCE_CHANGE_EVENT));
}

// Runs in <head> before first paint, so there's no flash of the wrong theme.
// It can't import anything, so it repeats parseAppearance + applyAppearance in plain JS.
export const appearanceScript = `(function(){try{
var a={};try{a=JSON.parse(localStorage.getItem("${APPEARANCE_STORAGE_KEY}"))||{}}catch(e){}
var t=a.theme==="dark"||a.theme==="auto"?a.theme:"${DEFAULT_APPEARANCE.theme}";
var d=t==="dark"||(t==="auto"&&matchMedia("(prefers-color-scheme: dark)").matches);
var c=typeof a.highContrast==="boolean"?a.highContrast:matchMedia("(prefers-contrast: more)").matches;
var r=document.documentElement;r.setAttribute("data-theme",d?"dark":"light");
if(c)r.setAttribute("data-contrast","high");else r.removeAttribute("data-contrast");
}catch(e){}})()`;
