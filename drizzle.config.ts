import { existsSync } from "node:fs";
import { defineConfig } from "drizzle-kit";

// drizzle-kit runs outside Next.js, so it doesn't read .env.local on its own.
if (existsSync(".env.local")) process.loadEnvFile(".env.local");

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
