import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// App icons for the browser tab, the PWA manifest, and Play Store packaging:
// Storm in the box (Figma "App Logo v1" › App Icon) on a lavender tile.
// Served at /icon/32, /icon/192, /icon/512, and /icon/maskable.
// The 32px browser tab icon has no tile, so Storm sits right on the tab.
const ICONS = [
  { id: "32", size: 32, padding: 0 },
  { id: "192", size: 192, padding: 0.12 },
  { id: "512", size: 512, padding: 0.12 },
  // Maskable icons get cropped to a circle or squircle, so keep Storm inside the safe zone.
  { id: "maskable", size: 512, padding: 0.22 },
];

export function generateImageMetadata() {
  return ICONS.map((icon) => ({
    id: icon.id,
    contentType: "image/png",
    size: { width: icon.size, height: icon.size },
  }));
}

export default async function Icon({ id }: { id: Promise<string | number> }) {
  const iconId = String(await id);
  const icon = ICONS.find((i) => i.id === iconId) ?? ICONS[1];
  const png = await readFile(join(process.cwd(), "public/brand/storm-icon.png"));
  const src = `data:image/png;base64,${png.toString("base64")}`;
  const inner = Math.round(icon.size * (1 - icon.padding * 2));

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          // Brand lavender. Icons are images, so they can't use the CSS tokens.
          // Home screen icons need the tile (iOS fills transparency with black).
          background: icon.id === "32" ? "transparent" : "#C49CF2",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} width={inner} height={Math.round(inner * (348 / 360))} alt="" />
      </div>
    ),
    { width: icon.size, height: icon.size },
  );
}
