"use client";

import { useEffect, useRef } from "react";
import { loadTurnstile, TURNSTILE_SITE_KEY, turnstileTheme, type TurnstileController } from "./useTurnstile";

type TurnstileProps = {
  controller: TurnstileController;
  // Shows up in the Cloudflare dashboard, so we can tell the forms apart.
  action: "signup" | "login" | "forgot_password" | "resend_verification";
  // "always" draws the widget box (forms). "interaction-only" stays hidden
  // unless Cloudflare needs the person to tap it (small inline buttons).
  appearance?: "always" | "interaction-only";
};

// The Cloudflare Turnstile widget (AUTH-02). Renders nothing without a site
// key, so forms still work in local dev and CI. Pair it with useTurnstile().
export default function Turnstile({ controller, action, appearance = "always" }: TurnstileProps) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY || !container.current) return;
    const element = container.current;
    let widgetId: string | undefined;
    let cancelled = false;

    loadTurnstile()
      .then((turnstile) => {
        if (cancelled) return;
        widgetId = turnstile.render(element, {
          sitekey: TURNSTILE_SITE_KEY,
          action,
          appearance,
          theme: turnstileTheme(),
          size: "flexible",
          callback: (token) => controller.setToken(token),
          "expired-callback": () => controller.setToken(null),
          "timeout-callback": () => {
            controller.setToken(null);
            controller.fail();
          },
          "error-callback": () => {
            controller.setToken(null);
            controller.fail();
            // Let Turnstile show its own retry message in the box.
            return false;
          },
        });
        controller.bind(widgetId ?? null);
      })
      .catch(() => controller.fail());

    return () => {
      cancelled = true;
      controller.bind(null);
      controller.setToken(null);
      if (widgetId) window.turnstile?.remove(widgetId);
    };
  }, [controller, action, appearance]);

  if (!TURNSTILE_SITE_KEY) return null;

  // Turnstile's box is 65px tall; holding the space stops the form jumping
  // while the script loads. Interaction-only takes no space until needed.
  return <div ref={container} className={appearance === "always" ? "min-h-[65px] w-full" : "w-full empty:hidden"} />;
}
