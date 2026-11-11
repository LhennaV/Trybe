// Shrinks a picked photo in the browser before it's uploaded (TRD section 13,
// decided 2026-11-11). Browser only: it uses the DOM and a canvas.
//
//   const blob = await resizeForUpload(file);
//   const form = new FormData();
//   form.append(PHOTO_FIELD, blob, "photo.jpg");
//   await fetch("/api/me/photo", { method: "POST", body: form });
//
// Why: Vercel refuses requests over 4.5 MB, phone photos are often bigger,
// and the server can't read iPhone HEIC. Drawing the photo on a canvas fixes
// both: it comes out as a smaller JPEG, upright, with no EXIF or GPS.

import { PHOTO_MAX_EDGE, PHOTO_PICK_MAX_BYTES, PHOTO_UPLOAD_MAX_BYTES } from "@/shared/contracts/photos";

export class PhotoTooBigError extends Error {
  constructor() {
    super(`That photo is over ${PHOTO_PICK_MAX_BYTES / 1024 / 1024} MB. Try a smaller one.`);
    this.name = "PhotoTooBigError";
  }
}

export class PhotoUnreadableError extends Error {
  constructor() {
    super("We couldn't open that photo. Try a JPEG or PNG.");
    this.name = "PhotoUnreadableError";
  }
}

// The size a photo should be drawn at so its longest side is at most
// `maxEdge`. Never makes a photo bigger.
export function fitWithin(width: number, height: number, maxEdge: number = PHOTO_MAX_EDGE) {
  const scale = Math.min(1, maxEdge / Math.max(width, height));
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}

function loadImage(file: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new PhotoUnreadableError());
    };
    image.src = url;
  });
}

function toJpeg(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new PhotoUnreadableError())), "image/jpeg", quality);
  });
}

// Throws PhotoTooBigError or PhotoUnreadableError with a message safe to show.
export async function resizeForUpload(file: File, maxEdge: number = PHOTO_MAX_EDGE): Promise<Blob> {
  if (file.size > PHOTO_PICK_MAX_BYTES) throw new PhotoTooBigError();

  // Browsers draw the photo upright (they apply the EXIF rotation), so the
  // result needs no rotation info.
  const image = await loadImage(file);
  const size = fitWithin(image.naturalWidth, image.naturalHeight, maxEdge);

  const canvas = document.createElement("canvas");
  canvas.width = size.width;
  canvas.height = size.height;
  const context = canvas.getContext("2d");
  if (!context) throw new PhotoUnreadableError();
  // JPEG has no transparency: PNGs get a white background instead of black.
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, size.width, size.height);
  context.drawImage(image, 0, 0, size.width, size.height);

  // Lower the quality if a busy photo still comes out too big.
  for (const quality of [0.9, 0.8, 0.7]) {
    const blob = await toJpeg(canvas, quality);
    if (blob.size <= PHOTO_UPLOAD_MAX_BYTES) return blob;
  }
  throw new PhotoTooBigError();
}
