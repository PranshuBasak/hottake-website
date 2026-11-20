import type { Game } from "./games";
import { absoluteUrl, gameCount, site } from "./site";

type Ld = Record<string, unknown>;

/** Renders schema.org JSON-LD. `<` is escaped so content can never close the script tag. */
export function JsonLd({ data }: { data: Ld | Ld[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

// Stable ids so every block on every page links into one graph.
export const ids = {
  website: `${site.url}/#website`,
  org: `${site.url}/#organization`,
  app: `${site.url}/#app`,
  person: `${site.url}/creator#person`,
};

export const websiteLd = (): Ld => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": ids.website,
  name: site.name,
  alternateName: "HotTake party games",
  url: site.url,
  description: site.description,
  inLanguage: "en",
  publisher: { "@id": ids.org },
});

export const personLd = (): Ld => ({
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": ids.person,
  name: site.creator.name,
  url: absoluteUrl("/creator"),
  image: absoluteUrl("/icons/icon-512.png"),
  sameAs: [site.creator.linkedin, site.creator.x, site.creator.github, site.creator.website],
  jobTitle: "Software developer",
  worksFor: { "@id": ids.org },
  knowsAbout: ["Rust", "WebRTC", "Game development", "Tauri", "TypeScript", "Next.js"],
});

export const organizationLd = (): Ld => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": ids.org,
  name: site.name,
  url: site.url,
  logo: { "@type": "ImageObject", url: absoluteUrl("/icons/icon-512.png"), width: 512, height: 512 },
  sameAs: ["https://github.com/PranshuBasak/hottake-website"],
  founder: { "@id": ids.person },
});

export const softwareLd = (): Ld => ({
  "@context": "https://schema.org",
  "@type": ["SoftwareApplication", "VideoGame"],
  "@id": ids.app,
  name: site.name,
  applicationCategory: "GameApplication",
  applicationSubCategory: "Party game",
  genre: ["Party game", "Local multiplayer"],
  gamePlatform: "Windows PC with phone controllers",
  playMode: ["MultiPlayer", "CoOp"],
  numberOfPlayers: { "@type": "QuantitativeValue", minValue: 1, maxValue: 8 },
  operatingSystem: "Windows 10, Windows 11",
  softwareVersion: site.version,
  description: site.description,
  url: site.url,
  image: absoluteUrl("/opengraph-image"),
  screenshot: absoluteUrl("/opengraph-image"),
  downloadUrl: absoluteUrl("/api/download"),
  installUrl: absoluteUrl("/download"),
  fileSize: `${site.installerSizeMb}MB`,
  isAccessibleForFree: true,
  inLanguage: "en",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD", availability: "https://schema.org/InStock" },
  author: { "@id": ids.person },
  publisher: { "@id": ids.org },
  featureList: [
    "Phones are the controllers, no app install",
    `${gameCount} built-in party games for 1–8 players`,
    "Low-latency WebRTC input",
    "Tournament mode",
    "Online play through your own tunnel",
    "Build your own games with a small SDK",
  ],
});

export const gameLd = (g: Game): Ld => ({
  "@context": "https://schema.org",
  "@type": "VideoGame",
  name: g.name,
  description: g.description,
  url: absoluteUrl(`/games/${g.id}`),
  image: absoluteUrl(g.cover),
  genre: g.tags.filter((t) => t !== "party"),
  numberOfPlayers: { "@type": "QuantitativeValue", minValue: g.players.min, maxValue: g.players.max },
  playMode: g.coop ? "CoOp" : "MultiPlayer",
  gamePlatform: "Windows PC with phone controllers",
  isPartOf: { "@id": ids.app },
  ...(g.credit?.author ? { contributor: { "@type": "Person", name: g.credit.author, url: g.credit.url ?? undefined } } : {}),
});

export const faqLd = (items: { q: string; a: string }[]): Ld => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: items.map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a } })),
});

export const breadcrumbLd = (items: { name: string; path: string }[]): Ld => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((i, n) => ({ "@type": "ListItem", position: n + 1, name: i.name, item: absoluteUrl(i.path) })),
});
