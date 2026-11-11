// Brand assets in one place. To change the logo, replace the file in
// public/brand/ and update the entry here (path and the file's real pixel
// size). Every screen, the app icons, and the emails should read from this,
// never from a hard-coded "/brand/..." path or size.
//
// Shared by frontend and backend: changes need agreement from both owners.

export type BrandImage = {
  // Path under public/, starting with "/".
  src: string;
  // The file's real size in pixels. Screens scale it with brandSize() so the
  // shape stays right even if a new logo has different proportions.
  width: number;
  height: number;
  alt: string;
};

export const BRAND = {
  name: "Trybe",
  tagline: "Curiosity killed the cat. Trybe brought it back.",
  // Storm in the box, no text. Used for icons, headers, and emails.
  icon: { src: "/brand/storm-icon.png", width: 480, height: 464, alt: "Trybe" },
  // Storm plus the wordmark.
  logo: { src: "/brand/storm-logo.png", width: 732, height: 702, alt: "Trybe" },
} as const satisfies { name: string; tagline: string; icon: BrandImage; logo: BrandImage };

// Width and height for showing a brand image `height` pixels tall, keeping
// its real proportions: <Image {...BRAND.icon} {...brandSize(BRAND.icon, 40)} />
export function brandSize(image: BrandImage, height: number) {
  return { width: Math.round((image.width / image.height) * height), height };
}

// Full URL of a brand image, for places outside the app such as emails.
export function brandUrl(image: BrandImage, siteUrl: string) {
  return new URL(image.src, siteUrl).toString();
}
