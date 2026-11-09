import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Two suites (docs/testing.md):
//   unit         fast, no database, runs everywhere       pnpm test
//   integration  real Postgres + Supabase Auth in Docker  pnpm test:integration
export default defineConfig({
  resolve: {
    tsconfigPaths: true,
    alias: {
      // `server-only` throws outside the React server build. Tests run server
      // code directly, so swap in the package's own empty module.
      "server-only": fileURLToPath(new URL("./node_modules/server-only/empty.js", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    coverage: {
      provider: "v8",
      include: ["src/server/**", "src/shared/**"],
      exclude: ["src/shared/mocks/**", "src/server/db/migrations/**"],
      reporter: ["text-summary", "html"],
    },
    projects: [
      {
        extends: true,
        test: { name: "unit", include: ["tests/unit/**/*.test.ts"] },
      },
      {
        extends: true,
        test: {
          name: "integration",
          include: ["tests/integration/**/*.test.ts"],
          setupFiles: ["tests/integration/setup.ts"],
          // One database, so files run one at a time.
          fileParallelism: false,
          testTimeout: 30_000,
          hookTimeout: 60_000,
        },
      },
    ],
  },
});
