"use client";

import { useEffect, useState } from "react";
import { handleSchema } from "@/shared/contracts/users";
import { handleCandidates } from "./handleSuggestion";
import { handleAlternatives, isHandleFree } from "./signupChecks";

export type HandleCheck =
  | { status: "idle" }
  | { status: "checking"; handle: string }
  | { status: "free"; handle: string }
  | { status: "taken"; handle: string; suggestions: string[] }
  // Couldn't reach the server. Sign up still works: it tries other handles.
  | { status: "unknown"; handle: string };

const WAIT_MS = 400;

// Checks, while people type their name, whether the handle made from it is
// free. If it's taken, finds a few free ones to offer instead.
export function useHandleCheck(displayName: string, email: string): HandleCheck {
  const made = displayName.trim() ? handleCandidates(displayName, email)[0] : "";
  // Nothing to check when the name can't make a valid handle (too short...).
  const base = made && handleSchema.safeParse(made).success ? made : "";
  const [result, setResult] = useState<HandleCheck>({ status: "idle" });

  useEffect(() => {
    if (!base) return;
    let active = true;
    const timer = setTimeout(async () => {
      const free = await isHandleFree(base);
      if (!active) return;
      if (free === null) return setResult({ status: "unknown", handle: base });
      if (free) return setResult({ status: "free", handle: base });

      const options = handleAlternatives(base).filter((h) => handleSchema.safeParse(h).success);
      const checks = await Promise.all(options.map(async (h) => ((await isHandleFree(h)) ? h : null)));
      if (!active) return;
      setResult({ status: "taken", handle: base, suggestions: checks.filter((h): h is string => h !== null).slice(0, 3) });
    }, WAIT_MS);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [base]);

  if (!base) return { status: "idle" };
  // Until the check for the current name comes back, it's "checking".
  return result.status !== "idle" && result.handle === base ? result : { status: "checking", handle: base };
}
