"use client";

import { useCallback, useMemo, useRef } from "react";

// Cloudflare Turnstile bot check (AUTH-02). No npm package: the widget is
// Cloudflare's own script, loaded once on the pages that need it.
// https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/
//
// Each token works once. Forms call getToken() right before a request and
// reset() right after it, whatever the result, so the next try gets a fresh one.
//
// Without NEXT_PUBLIC_TURNSTILE_SITE_KEY (local dev without the env file, CI)
// there's no widget and getToken() gives undefined. The API accepts that
// until CAPTCHA is turned on in Supabase.

export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

const SCRIPT_URL = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

// How long a submit waits for a check that's still running. After that the
// request goes without a token and the API answers CAPTCHA_FAILED.
const TOKEN_WAIT_MS = 8000;

export type TurnstileOptions = {
  sitekey: string;
  action?: string;
  theme?: "light" | "dark" | "auto";
  size?: "normal" | "flexible" | "compact";
  appearance?: "always" | "execute" | "interaction-only";
  callback?: (token: string) => void;
  "expired-callback"?: () => void;
  "error-callback"?: () => boolean | void;
  "timeout-callback"?: () => void;
};

type TurnstileApi = {
  render: (container: HTMLElement, options: TurnstileOptions) => string | undefined;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let scriptPromise: Promise<TurnstileApi> | null = null;

export function loadTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  scriptPromise ??= new Promise<TurnstileApi>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_URL;
    script.async = true;
    script.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error("Turnstile missing")));
    script.onerror = () => {
      scriptPromise = null; // let a later screen try again
      reject(new Error("Turnstile failed to load"));
    };
    document.head.appendChild(script);
  });
  return scriptPromise;
}

// The widget follows the app's theme (data-theme on <html>), not only the OS.
export function turnstileTheme(): "light" | "dark" {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

export type TurnstileController = {
  // Gives the current token, waiting for a check that's still running.
  getToken: () => Promise<string | undefined>;
  // Throws away the used token and starts a new check.
  reset: () => void;
  // Used by <Turnstile>: the widget reports in here.
  bind: (widgetId: string | null) => void;
  setToken: (token: string | null) => void;
  // The check failed or timed out: stop waiting for it.
  fail: () => void;
};

export function useTurnstile(): TurnstileController {
  const widgetId = useRef<string | null>(null);
  const token = useRef<string | null>(null);
  const waiters = useRef<((token: string | undefined) => void)[]>([]);

  const settle = useCallback((value: string | undefined) => {
    const pending = waiters.current;
    waiters.current = [];
    for (const resolve of pending) resolve(value);
  }, []);

  const setToken = useCallback(
    (value: string | null) => {
      token.current = value;
      if (value) settle(value);
    },
    [settle],
  );

  const getToken = useCallback(() => {
    if (!TURNSTILE_SITE_KEY) return Promise.resolve(undefined);
    if (token.current) return Promise.resolve(token.current);
    // No widget on screen (script blocked or failed): don't make people wait.
    if (!widgetId.current) return Promise.resolve(undefined);
    return new Promise<string | undefined>((resolve) => {
      const timer = setTimeout(() => {
        waiters.current = waiters.current.filter((w) => w !== done);
        resolve(undefined);
      }, TOKEN_WAIT_MS);
      const done = (value: string | undefined) => {
        clearTimeout(timer);
        resolve(value);
      };
      waiters.current.push(done);
    });
  }, []);

  const reset = useCallback(() => {
    token.current = null;
    if (widgetId.current) window.turnstile?.reset(widgetId.current);
  }, []);

  const bind = useCallback((id: string | null) => {
    widgetId.current = id;
  }, []);

  const fail = useCallback(() => settle(undefined), [settle]);

  return useMemo(() => ({ getToken, reset, bind, setToken, fail }), [getToken, reset, bind, setToken, fail]);
}
