import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "HotTake — party games",
    short_name: site.name,
    description: site.description,
    start_url: "/?source=pwa",
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "minimal-ui"],
    orientation: "any",
    background_color: "#120d0b",
    theme_color: "#120d0b",
    lang: "en",
    dir: "ltr",
    categories: ["games", "entertainment"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
    ],
    shortcuts: [
      { name: "All games", url: "/games", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "How to play", url: "/how-to-play", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Download", url: "/download", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
