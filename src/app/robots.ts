import type { MetadataRoute } from "next";

// robots.txt (TRD section 16, SEO). Tells search engines what to crawl.
// It is a polite request, not security: anything private is protected by
// login and the API, never by this file.
//
// Built once per deploy. Preview deployments (every pull request) and local
// builds block everything, so test data and half-finished screens never end
// up in search results. Only the production deployment allows crawling.

// Public pages worth finding in search: the landing page, About, legal and
// safety pages, the public account deletion page (Play Store), posts, and
// profiles. Feed and Explore can be browsed logged out.
const ALLOW = ["/"];

// Pages that only make sense logged in, one-off steps, or endless variations.
const DISALLOW = [
  "/api/",
  "/admin",
  "/settings",
  "/profile",
  "/trades",
  "/notifications",
  "/new",
  "/saved",
  "/report",
  "/search",
  "/posts/*/propose",
  "/onboarding",
  "/welcome",
  "/forgot-password",
  "/reset-password",
  "/offline",
  "/preview",
];

export default function robots(): MetadataRoute.Robots {
  // Set by Vercel at build time: "production", "preview", or "development".
  if (process.env.VERCEL_ENV !== "production") {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  // Add `sitemap` here once src/app/sitemap.ts exists (TRD section 16).
  return { rules: { userAgent: "*", allow: ALLOW, disallow: DISALLOW } };
}
