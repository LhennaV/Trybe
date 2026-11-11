import { afterEach, describe, expect, it, vi } from "vitest";
import robots from "@/app/robots";

// robots.txt: only production may be crawled, and private pages never.
afterEach(() => vi.unstubAllEnvs());

describe("robots.txt", () => {
  it("blocks everything outside production (previews, local)", () => {
    for (const env of ["preview", "development", ""]) {
      vi.stubEnv("VERCEL_ENV", env);
      expect(robots().rules).toEqual({ userAgent: "*", disallow: "/" });
    }
  });

  it("lets production be crawled, except pages behind a login", () => {
    vi.stubEnv("VERCEL_ENV", "production");
    const rules = robots().rules as { allow: string[]; disallow: string[] };

    expect(rules.allow).toContain("/");
    for (const page of ["/api/", "/admin", "/settings", "/trades", "/reset-password"]) {
      expect(rules.disallow).toContain(page);
    }
    // Public pages stay crawlable.
    for (const page of ["/about", "/posts", "/users", "/terms", "/privacy", "/delete-account"]) {
      expect(rules.disallow.some((rule) => page.startsWith(rule.replace("*", "")))).toBe(false);
    }
  });
});
