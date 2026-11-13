"use client";

import { useEffect, useSyncExternalStore } from "react";
import type { Me } from "@/shared/contracts/users";
import { apiRequest } from "@/components/api/request";

// The signed-in person (GET /api/me), shared by every screen that shows it:
// the profile page, the sidebar, Edit profile. Loaded once, and updated in
// place after a save, so a new name or photo shows everywhere right away.

export type MeState =
  | { status: "loading" }
  | { status: "signed-out" }
  | { status: "error"; message: string }
  | { status: "ready"; me: Me };

let state: MeState = { status: "loading" };
let request: Promise<void> | null = null;
const listeners = new Set<() => void>();

function set(next: MeState) {
  state = next;
  for (const listener of listeners) listener();
}

export function loadMe(force = false) {
  if (request && !force) return request;
  request = apiRequest<Me>("/api/me").then((result) => {
    if (result.ok) set({ status: "ready", me: result.data });
    else if (result.code === "UNAUTHENTICATED") set({ status: "signed-out" });
    else {
      set({ status: "error", message: result.message });
      request = null; // let the next screen try again
    }
  });
  return request;
}

// Call after anything that returns a fresh /api/me (PATCH /api/me, photo).
export function setMe(me: Me) {
  set({ status: "ready", me });
}

// Call after logging in or out, so screens never show the previous account.
export function resetMe() {
  request = null;
  set({ status: "loading" });
  void loadMe(true);
}

const LOADING: MeState = { status: "loading" };

export function useMe(): MeState {
  useEffect(() => {
    void loadMe();
  }, []);
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => state,
    () => LOADING,
  );
}

// "Today", "12 d", "3 mo", "2 yr": how long someone has been on Trybe.
export function timeOnTrybe(memberSince: string, now: Date = new Date()) {
  const days = Math.floor((now.getTime() - new Date(memberSince).getTime()) / 86_400_000);
  if (days < 1) return "Today";
  if (days < 30) return `${days} d`;
  if (days < 365) return `${Math.floor(days / 30)} mo`;
  return `${Math.floor(days / 365)} yr`;
}
