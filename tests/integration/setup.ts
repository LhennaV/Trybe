import { existsSync } from "node:fs";
import { vi } from "vitest";

// Integration tests talk to the local Supabase stack only. Start it with
// `pnpm db:test:start`, which writes .env.test.local.
if (!existsSync(".env.test.local")) {
  throw new Error("Missing .env.test.local. Run `pnpm db:test:start` first (needs Docker).");
}
process.loadEnvFile(".env.test.local");

// Hard stop: never run these tests against the dev or production project.
for (const key of ["DATABASE_URL", "NEXT_PUBLIC_SUPABASE_URL"]) {
  const host = new URL(process.env[key] ?? "").hostname;
  if (host !== "127.0.0.1" && host !== "localhost") {
    throw new Error(`${key} points at ${host}. Integration tests only run against the local stack.`);
  }
}

// Route handlers run here without a Next.js server. connection() and
// cookies() only work inside a request, so they're replaced with stand-ins
// that behave the same for our code: connection() does nothing, and cookies()
// is an in-memory jar the test can inspect.
const cookieJar = vi.hoisted(() => new Map<string, string>());

vi.mock("next/server", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/server")>()),
  connection: async () => {},
}));

vi.mock("next/headers", () => ({
  cookies: async () => ({
    getAll: () => [...cookieJar].map(([name, value]) => ({ name, value })),
    get: (name: string) => (cookieJar.has(name) ? { name, value: cookieJar.get(name) } : undefined),
    set: (name: string, value: string) => void cookieJar.set(name, value),
    delete: (name: string) => void cookieJar.delete(name),
  }),
}));

(globalThis as { testCookieJar?: Map<string, string> }).testCookieJar = cookieJar;
