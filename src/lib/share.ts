import type { Metadata } from "next";
import { site } from "./site";

/** Social previews cut descriptions at about 125 characters, so share text stays under 120 (at a word boundary). */
export function shareText(s: string, max = 120): string {
  if (s.length <= max) return s;
  const cut = s.slice(0, s.lastIndexOf(" ", max - 1)).replace(/[,;:.\s]+$/, "");
  return `${cut}…`;
}

const OG_IMAGE = { url: "/opengraph-image", width: 1200, height: 630, alt: "HotTake: party games where every phone is a controller" };

/** Open Graph + Twitter fields for a page: short description, the shared card image unless one is given. */
export function share(opts: {
  path: string;
  title: string;
  description: string;
  type?: "website" | "article" | "profile";
  image?: boolean;
}): Pick<Metadata, "openGraph" | "twitter"> {
  const description = shareText(opts.description);
  const images = opts.image === false ? undefined : [OG_IMAGE];
  return {
    openGraph: { url: opts.path, title: opts.title, description, type: opts.type ?? "website", ...(images ? { images } : {}) },
    twitter: { card: "summary_large_image", site: site.creator.xHandle, creator: site.creator.xHandle, title: opts.title, description, ...(images ? { images: images.map((i) => i.url) } : {}) },
  };
}
