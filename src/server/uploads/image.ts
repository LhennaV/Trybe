import "server-only";
import sharp from "sharp";
import { AppError } from "@/server/errors";

// Image processing for every upload (TRD section 13). The browser already
// shrank the photo; this is the part we trust:
// - only real JPEG, PNG, or WebP images get through (checked from the bytes,
//   not the file name or the type the browser claims). No SVG, GIF, or HEIC.
// - EXIF and GPS are dropped: sharp writes no metadata unless asked to.
// - the output is always WebP, at each requested size.

const ALLOWED_FORMATS = new Set(["jpeg", "png", "webp"]);
// Refuse absurd dimensions before decoding (a tiny file can claim to be huge).
const MAX_INPUT_PIXELS = 40_000_000;

export type ImageVariant = { edge: number; data: Buffer; width: number; height: number };

function unreadable() {
  return new AppError("VALIDATION_FAILED", "We couldn't read that photo. Try a JPEG or PNG.", {
    photo: ["We couldn't read that photo. Try a JPEG or PNG."],
  });
}

// Makes one WebP per size in `edges` (the longest side, never enlarged).
export async function processImage(input: Buffer, edges: readonly number[]): Promise<ImageVariant[]> {
  let format: string | undefined;
  try {
    ({ format } = await sharp(input, { limitInputPixels: MAX_INPUT_PIXELS }).metadata());
  } catch {
    throw unreadable();
  }
  if (!format || !ALLOWED_FORMATS.has(format)) throw unreadable();

  try {
    return await Promise.all(
      edges.map(async (edge) => {
        const { data, info } = await sharp(input, { limitInputPixels: MAX_INPUT_PIXELS })
          // Turn the photo upright using its EXIF rotation, before EXIF is dropped.
          .rotate()
          .resize({ width: edge, height: edge, fit: "inside", withoutEnlargement: true })
          .webp({ quality: 80 })
          .toBuffer({ resolveWithObject: true });
        return { edge, data, width: info.width, height: info.height };
      }),
    );
  } catch {
    throw unreadable();
  }
}
