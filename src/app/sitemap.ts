import type { MetadataRoute } from "next";
import { docHref, docsPages } from "@/lib/docs";
import { getGames } from "@/lib/games";
import { absoluteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date("2026-11-15");
  const pages: [string, number, MetadataRoute.Sitemap[number]["changeFrequency"]][] = [
    ["/", 1, "weekly"],
    ["/games", 0.9, "weekly"],
    ["/how-to-play", 0.8, "monthly"],
    ["/download", 0.9, "weekly"],
    ["/creator", 0.6, "monthly"],
    ["/privacy", 0.2, "yearly"],
    ["/terms", 0.2, "yearly"],
    ["/cookies", 0.2, "yearly"],
  ];
  return [
    ...pages.map(([path, priority, changeFrequency]) => ({ url: absoluteUrl(path), lastModified: now, changeFrequency, priority })),
    ...docsPages().map((p) => ({
      url: absoluteUrl(docHref(p.slug)),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: p.slug === "index" ? 0.7 : 0.5,
    })),
    ...getGames().map((g) => ({
      url: absoluteUrl(`/games/${g.id}`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
      images: [absoluteUrl(g.cover)],
    })),
  ];
}
