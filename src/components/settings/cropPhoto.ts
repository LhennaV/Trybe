// Square crop for profile photos. Plain TS (no React) so a native app can
// reuse the math. Browser only for cropToBlob(): it draws on a canvas.
//
// The cropper shows the photo in a square `view` px wide. The photo always
// covers the square: at zoom 1 its short side fits exactly. x and y are how
// far the photo's center is moved from the square's center, in screen px.

import { AVATAR_EDGE } from "@/shared/contracts/photos";

export type Crop = { zoom: number; x: number; y: number };

export const MIN_ZOOM = 1;
export const MAX_ZOOM = 3;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

// Screen px per photo px.
export function cropScale(width: number, height: number, view: number, zoom: number) {
  return (view / Math.min(width, height)) * zoom;
}

// Keeps the zoom in range and stops the photo leaving a gap at any edge.
export function clampCrop(crop: Crop, width: number, height: number, view: number): Crop {
  const zoom = clamp(crop.zoom, MIN_ZOOM, MAX_ZOOM);
  const scale = cropScale(width, height, view, zoom);
  const maxX = Math.max(0, (width * scale - view) / 2);
  const maxY = Math.max(0, (height * scale - view) / 2);
  return { zoom, x: clamp(crop.x, -maxX, maxX), y: clamp(crop.y, -maxY, maxY) };
}

// The part of the original photo inside the square, in photo px.
export function cropSourceRect(crop: Crop, width: number, height: number, view: number) {
  const scale = cropScale(width, height, view, crop.zoom);
  const size = view / scale;
  return {
    sx: width / 2 - (view / 2 + crop.x) / scale,
    sy: height / 2 - (view / 2 + crop.y) / scale,
    size,
  };
}

// Draws the cropped square as a JPEG, at most AVATAR_EDGE px (the size the
// server keeps anyway).
export function cropToBlob(image: HTMLImageElement, crop: Crop, view: number): Promise<Blob> {
  const { naturalWidth: width, naturalHeight: height } = image;
  const { sx, sy, size } = cropSourceRect(crop, width, height, view);
  const edge = Math.max(1, Math.min(AVATAR_EDGE, Math.round(size)));

  const canvas = document.createElement("canvas");
  canvas.width = edge;
  canvas.height = edge;
  const context = canvas.getContext("2d");
  if (!context) return Promise.reject(new Error("Canvas not available"));
  context.drawImage(image, sx, sy, size, size, 0, 0, edge, edge);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Crop failed"))), "image/jpeg", 0.9);
  });
}
