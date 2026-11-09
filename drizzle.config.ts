import { existsSync } from "node:fs";
import { defineConfig } from "drizzle-kit";

// drizzle-kit runs outside Next.js, so it doesn't read .env.local on its own.
// Skipped when a URL is already set, so the test database script
// (scripts/test-db.mjs) can never be pointed at the dev project by .env.local.
if (!process.env.DIRECT_DATABASE_URL && existsSync(".env.local")) process.loadEnvFile(".env.local");

// Migrations use the direct connection, not the pooler (TRD section 17).
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/server/db/schema.ts",
  out: "./src/server/db/migrations",
  dbCredentials: { url: process.env.DIRECT_DATABASE_URL ?? "" },
  entities: { roles: { provider: "supabase" } },
  strict: true,
  verbose: true,
});
