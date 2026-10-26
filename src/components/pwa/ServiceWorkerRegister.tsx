"use client";

import { useEffect } from "react";

// Registers /sw.js in production builds. Skipped in dev so cached pages never
// get in the way while working on the app.
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Not fatal: the app works without it, just not offline.
    });
  }, []);

  return null;
}
