import { existsSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { BRAND, brandSize, brandUrl } from "@/shared/brand";

// If someone swaps a logo file but forgets to update src/shared/brand.ts,
// this fails instead of every screen showing a squashed logo.
describe("brand images", () => {
  it.each(Object.entries({ icon: BRAND.icon, logo: BRAND.logo }))(
    "%s points at a real file with the size written in brand.ts",
    async (_name, image) => {
      const file = join(process.cwd(), "public", image.src);
      expect(existsSync(file), file).toBe(true);
      const { width, height } = await sharp(file).metadata();
      expect({ width, height }).toEqual({ width: image.width, height: image.height });
    },
  );

  it("keeps proportions when scaling", () => {
    expect(brandSize({ src: "/x.png", width: 480, height: 464, alt: "" }, 40)).toEqual({ width: 41, height: 40 });
  });

  it("builds full URLs for emails", () => {
    expect(brandUrl(BRAND.icon, "https://trybe-puce.vercel.app")).toBe(
      "https://trybe-puce.vercel.app/brand/storm-icon.png",
    );
  });
});
