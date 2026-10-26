import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Home screen icon for iPhone (installed from Safari).
export default async function AppleIcon() {
  const png = await readFile(join(process.cwd(), "public/brand/storm-icon.png"));
  const src = `data:image/png;base64,${png.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#C49CF2",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} width={140} height={135} alt="" />
      </div>
    ),
    size,
  );
}
