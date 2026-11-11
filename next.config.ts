import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs/config";

const nextConfig: NextConfig = {
  // E2E and performance tests build into their own folder (.next-test), so
  // they never touch the .next folder a running `pnpm dev` is using.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  images: {
    // Photos from our Supabase Storage bucket only. The host comes from
    // NEXT_PUBLIC_SUPABASE_URL, never hard-coded, so a new project or
    // domain only means changing that value.
    remotePatterns: process.env.NEXT_PUBLIC_SUPABASE_URL
      ? [new URL("/storage/v1/object/public/photos/**", process.env.NEXT_PUBLIC_SUPABASE_URL)]
      : [],
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

// Source maps upload to Sentry only when SENTRY_AUTH_TOKEN is set (Vercel builds).
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
});
