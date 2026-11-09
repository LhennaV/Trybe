// Runs the k6 performance test (docs/testing.md section 9).
//
//   pnpm test:performance            build, start against the local test
//                                    database, run the load test, stop
//   pnpm test:performance -- --smoke 1 user for 15s instead
//
// To check a deployed preview instead (light load only, never production
// without the team agreeing first):
//   pnpm test:performance -- --smoke --url https://<preview>.vercel.app --handle <existing handle>
//
// Uses an installed `k6` if there is one, otherwise the grafana/k6 Docker image.

import { execSync, spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const option = (name) => {
  const index = args.indexOf(`--${name}`);
  return index >= 0 ? args[index + 1] : undefined;
};

const remoteUrl = option("url");
const profile = flag("smoke") ? "smoke" : "load";
const PORT = 3100;
const LOCAL_URL = `http://127.0.0.1:${PORT}`;
const PERF_HANDLE = "perf.trader";

function hasK6() {
  try {
    execSync("k6 version", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

async function waitFor(url, timeoutMs = 120_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      if ((await fetch(url)).ok) return;
    } catch {
      // not up yet
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw new Error(`${url} didn't come up within ${timeoutMs / 1000}s.`);
}

// The profile endpoint needs a real user. Made once, on the local stack only.
async function ensurePerfUser() {
  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error } = await admin.auth.admin.createUser({
    email: "perf.trader@example.test",
    password: "perf-password-123",
    email_confirm: true,
    user_metadata: { display_name: "Perf Trader", handle: PERF_HANDLE, terms_accepted: true, age_confirmed: true },
  });
  if (error && !/already/i.test(error.message)) throw error;
}

function runK6(baseUrl, handle) {
  const env = { BASE_URL: baseUrl, PERF_HANDLE: handle, PERF_PROFILE: profile };
  if (hasK6()) {
    execSync("k6 run tests/performance/api.js", { stdio: "inherit", env: { ...process.env, ...env } });
    return;
  }
  // Docker: the container reaches this machine through host.docker.internal.
  const dockerUrl = baseUrl.replace("127.0.0.1", "host.docker.internal").replace("localhost", "host.docker.internal");
  const envFlags = Object.entries({ ...env, BASE_URL: dockerUrl })
    .map(([key, value]) => `-e ${key}=${value}`)
    .join(" ");
  execSync(`docker run --rm -i ${envFlags} grafana/k6 run - < tests/performance/api.js`, { stdio: "inherit" });
}

if (remoteUrl) {
  if (/trybe-puce\.vercel\.app/.test(remoteUrl) && !flag("i-know-this-is-production")) {
    throw new Error("That's the production URL. Use a preview URL, or agree with the team first.");
  }
  runK6(remoteUrl, option("handle") ?? PERF_HANDLE);
} else {
  if (!existsSync(".env.test.local")) throw new Error("Run `pnpm db:test:start` first (needs Docker).");
  process.loadEnvFile(".env.test.local");
  const host = new URL(process.env.DATABASE_URL).hostname;
  if (host !== "127.0.0.1" && host !== "localhost") throw new Error("Performance tests only run on the local stack.");

  await ensurePerfUser();

  // Values passed here win over .env.local, so the app talks to the local stack.
  // .next-test keeps this build away from the .next folder `pnpm dev` uses.
  const appEnv = { ...process.env, PORT: String(PORT), NEXT_DIST_DIR: ".next-test" };
  execSync("pnpm build", { stdio: "inherit", env: appEnv });
  // Started with node directly (no shell in between), so killing it really
  // stops the server. Through a shell on Windows, the server outlived the test.
  const nextBin = fileURLToPath(import.meta.resolve("next/dist/bin/next"));
  const server = spawn(process.execPath, [nextBin, "start", "-H", "127.0.0.1", "-p", String(PORT)], {
    stdio: ["ignore", "ignore", "inherit"],
    env: appEnv,
  });

  try {
    await waitFor(`${LOCAL_URL}/api/health`);
    runK6(LOCAL_URL, PERF_HANDLE);
  } finally {
    server.kill();
  }
}
