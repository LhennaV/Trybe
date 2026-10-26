import type { MetadataRoute } from "next";

// Web app manifest so Trybe installs from the browser (PWA) and can be
// packaged for Google Play with PWABuilder.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Trybe",
    short_name: "Trybe",
    description: "Trade the gear you've outgrown for the hobby you're curious about.",
    start_url: "/",
    display: "standalone",
    theme_color: "#674390",
    background_color: "#FFF9F2",
    icons: [
      { src: "/icon/192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon/512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon/maskable", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
