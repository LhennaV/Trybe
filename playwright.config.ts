import { existsSync } from "node:fs";
import { defineConfig, devices } from "@playwright/test";

// End-to-end tests (docs/testing.md section 8). They run the production build
// against the local Supabase stack, never the dev or production project.
// Start the stack first: `pnpm db:test:start` (writes .env.test.local).
if (existsSync(".env.test.local")) process.loadEnvFile(".env.test.local");

const APP_URL = process.env.TEST_APP_URL ?? "http://127.0.0.1:3100";
const { port, hostname } = new URL(APP_URL);

// Variables the app needs, all from the local stack.
const appEnv = Object.fromEntries(
  [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "DATABASE_URL",
    "DIRECT_DATABASE_URL",
  ].map((key) => [key, process.env[key] ?? ""]),
);
// Its own build folder, so a running `pnpm dev` (which uses .next) is never touched.
appEnv.NEXT_DIST_DIR = ".next-test";
// Cloudflare's test site key: the widget always passes, on any hostname. The
// real key (from .env.local) only works on the hostnames listed in Cloudflare,
// and the local stack has CAPTCHA off anyway.
// https://developers.cloudflare.com/turnstile/troubleshooting/testing/
appEnv.NEXT_PUBLIC_TURNSTILE_SITE_KEY = "1x00000000000000000000AA";

export default defineConfig({
  testDir: "tests/e2e",
  testMatch: "**/*.spec.ts",
  // One database and one mailbox: run the flows one after another.
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  timeout: 60_000,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : [["list"]],
  use: {
    baseURL: APP_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  // Mobile first: test on a phone-sized screen (AGENTS.md, Design and UI).
  projects: [{ name: "phone", use: { ...devices["Pixel 7"] } }],
  webServer: {
    // The Next.js docs recommend testing the production build. It goes to
    // .next-test with the local stack's values baked in.
    command: `pnpm build && pnpm start -H ${hostname} -p ${port}`,
    url: `${APP_URL}/api/health`,
    env: appEnv,
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
  },
});
