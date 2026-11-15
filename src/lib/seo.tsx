import type { Game } from "./games";
import { absoluteUrl, site } from "./site";

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

export const websiteLd = (): Ld => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: site.name,
  url: site.url,
  description: site.description,
  inLanguage: "en",
});

export const personLd = (): Ld => ({
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": `${site.url}/creator#person`,
  name: site.creator.name,
  url: absoluteUrl("/creator"),
  sameAs: [site.creator.linkedin, site.creator.github],
  jobTitle: "Software developer",
  knowsAbout: ["Rust", "WebRTC", "Game development", "Tauri", "TypeScript"],
});

export const organizationLd = (): Ld => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: site.name,
  url: site.url,
  logo: absoluteUrl("/icon.svg"),
  founder: { "@id": `${site.url}/creator#person` },
});

export const softwareLd = (): Ld => ({
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: site.name,
  applicationCategory: "GameApplication",
  applicationSubCategory: "Party game",
  operatingSystem: "Windows 10, Windows 11",
  softwareVersion: site.version,
  description: site.description,
  url: site.url,
  downloadUrl: absoluteUrl("/download"),
  fileSize: `${site.installerSizeMb}MB`,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  author: { "@id": `${site.url}/creator#person` },
  featureList: [
    "Phones are the controllers — no app install",
    "32 built-in party games for 1–8 players",
    "Low-latency WebRTC input",
    "Tournament mode",
    "Online play through a link",
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
  isPartOf: { "@type": "SoftwareApplication", name: site.name, url: site.url },
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
