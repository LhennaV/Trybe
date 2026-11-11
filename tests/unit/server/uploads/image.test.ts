import sharp from "sharp";
import { afterEach, describe, expect, it, vi } from "vitest";
import { fitWithin } from "@/shared/images/resizeForUpload";
import { processImage } from "@/server/uploads/image";
import { photoPathFromUrl, publicPhotoUrl } from "@/server/uploads/storage";

// Real images made with sharp, so the checks run on actual bytes.
function photo(width: number, height: number, format: "jpeg" | "png" | "webp" | "gif" = "jpeg") {
  return sharp({ create: { width, height, channels: 3, background: { r: 120, g: 80, b: 160 } } })
    .toFormat(format)
    .toBuffer();
}

describe("processImage", () => {
  it("makes a WebP at each size, never bigger than the original", async () => {
    const variants = await processImage(await photo(3000, 2000), [1600, 400]);
    expect(variants.map((v) => [v.width, v.height])).toEqual([
      [1600, 1067],
      [400, 267],
    ]);
    for (const variant of variants) {
      expect((await sharp(variant.data).metadata()).format).toBe("webp");
    }

    const [small] = await processImage(await photo(200, 100), [400]);
    expect([small.width, small.height]).toEqual([200, 100]);
  });

  it("removes EXIF, including GPS", async () => {
    const withGps = await sharp(await photo(800, 600))
      .withExif({ IFD0: { Make: "TestCam" }, IFD3: { GPSLatitudeRef: "N", GPSLatitude: "14/1 39/1 0/1" } })
      .jpeg()
      .toBuffer();
    expect((await sharp(withGps).metadata()).exif).toBeDefined();

    const [out] = await processImage(withGps, [400]);
    expect((await sharp(out.data).metadata()).exif).toBeUndefined();
  });

  it("turns photos upright using their EXIF rotation", async () => {
    // A wide photo the camera marked as "rotate 90°" (orientation 6).
    const sideways = await sharp(await photo(300, 100)).withMetadata({ orientation: 6 }).jpeg().toBuffer();
    const [out] = await processImage(sideways, [400]);
    expect([out.width, out.height]).toEqual([100, 300]);
  });

  it("accepts PNG and WebP", async () => {
    for (const format of ["png", "webp"] as const) {
      await expect(processImage(await photo(50, 50, format), [400])).resolves.toHaveLength(1);
    }
  });

  it("refuses anything that isn't a JPEG, PNG, or WebP, whatever it's called", async () => {
    const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"/>');
    for (const input of [Buffer.from("not a photo"), svg, await photo(10, 10, "gif"), Buffer.alloc(0)]) {
      await expect(processImage(input, [400])).rejects.toMatchObject({
        code: "VALIDATION_FAILED",
        fields: { photo: [expect.any(String)] },
      });
    }
  });
});

describe("fitWithin (browser shrinking)", () => {
  it("shrinks the longest side to the limit and keeps the shape", () => {
    expect(fitWithin(4032, 3024, 1600)).toEqual({ width: 1600, height: 1200 });
    expect(fitWithin(3024, 4032, 1600)).toEqual({ width: 1200, height: 1600 });
  });

  it("never enlarges small photos", () => {
    expect(fitWithin(800, 600, 1600)).toEqual({ width: 800, height: 600 });
  });
});

describe("photo URLs", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("builds URLs from NEXT_PUBLIC_SUPABASE_URL and reads the path back", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://abc.supabase.co");
    const url = publicPhotoUrl("users/u1/avatar-1.webp");
    expect(url).toBe("https://abc.supabase.co/storage/v1/object/public/photos/users/u1/avatar-1.webp");
    expect(photoPathFromUrl(url)).toBe("users/u1/avatar-1.webp");
  });

  it("ignores URLs that aren't our photos", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://abc.supabase.co");
    expect(photoPathFromUrl("https://evil.example/storage/v1/object/public/photos/x.webp")).toBeNull();
    expect(photoPathFromUrl("https://abc.supabase.co/storage/v1/object/public/other/x.webp")).toBeNull();
    expect(photoPathFromUrl("not a url")).toBeNull();
  });
});
