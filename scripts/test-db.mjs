// Local test database (docs/testing.md section 3). Runs the Supabase local
// stack in Docker, applies our Drizzle migrations, and writes .env.test.local
// for integration and E2E tests. Never touches the dev or production project.
//
//   node scripts/test-db.mjs start   start the stack, migrate, write env
//   node scripts/test-db.mjs reset   wipe the database and migrate again
//   node scripts/test-db.mjs stop    stop the stack

import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";

// Services the tests don't use yet. Leaving them out makes start faster.
const EXCLUDE = "realtime,storage-api,imgproxy,edge-runtime,logflare,vector,supavisor,studio,postgres-meta";
const ENV_FILE = ".env.test.local";
// E2E runs the app here; supabase/config.toml site_url points at it.
const APP_URL = "http://127.0.0.1:3100";

// Commands are fixed strings (no user input). They go through the shell so
// pnpm.cmd works on Windows.
function run(command, options = {}) {
  return execSync(command, { stdio: "inherit", ...options });
}

function status() {
  const out = execSync("pnpm exec supabase status -o json", {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  });
  return JSON.parse(out.slice(out.indexOf("{")));
}

function migrate(dbUrl) {
  const host = new URL(dbUrl).hostname;
  // Hard stop: this script must only ever migrate a database on this machine.
  if (host !== "127.0.0.1" && host !== "localhost") {
    throw new Error(`Refusing to migrate a non-local database (${host}).`);
  }
  run("pnpm exec drizzle-kit migrate", { env: { ...process.env, DIRECT_DATABASE_URL: dbUrl } });
}

function writeEnv(s) {
  const env = {
    NEXT_PUBLIC_SUPABASE_URL: s.API_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: s.ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: s.SERVICE_ROLE_KEY,
    // The local stack has no pooler; both URLs are the same database.
    DATABASE_URL: s.DB_URL,
    DIRECT_DATABASE_URL: s.DB_URL,
    MAILPIT_URL: s.MAILPIT_URL ?? s.INBUCKET_URL,
    TEST_APP_URL: APP_URL,
  };
  const body = Object.entries(env)
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");
  writeFileSync(ENV_FILE, `# Written by scripts/test-db.mjs. Local test stack only.\n${body}\n`);
  console.log(`\nWrote ${ENV_FILE}`);
}

const command = process.argv[2];

if (command === "start") {
  run(`pnpm exec supabase start -x ${EXCLUDE}`);
  const s = status();
  migrate(s.DB_URL);
  writeEnv(s);
} else if (command === "reset") {
  // Recreates the database (auth schema included), then applies our migrations.
  run("pnpm exec supabase db reset --local --no-seed");
  const s = status();
  migrate(s.DB_URL);
  writeEnv(s);
} else if (command === "stop") {
  run("pnpm exec supabase stop");
} else {
  console.error("Usage: node scripts/test-db.mjs <start|reset|stop>");
  process.exit(1);
}
