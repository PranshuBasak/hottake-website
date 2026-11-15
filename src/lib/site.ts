export const site = {
  name: "HotTake",
  tagline: "Your laptop is the console. Every phone is a controller.",
  description:
    "HotTake turns a Windows laptop into a party-game console. Friends scan a QR code and play 32 built-in games with their phones as controllers — no app install, no cloud server.",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, ""),
  version: "0.1.0",
  installerName: "HotTake_0.1.0_x64-setup.exe",
  installerSizeMb: 12.5,
  creator: {
    name: "Pranshu Basak",
    linkedin: "https://www.linkedin.com/in/pranshubasak/",
    // Placeholders Pranshu still needs to confirm (see design doc "Needs from Pranshu").
    github: "https://github.com/pranshubasak",
    email: "hello@pranshubasak.site",
  },
  legal: {
    updated: "15 November 2026",
    jurisdiction: "India",
  },
  keywords: [
    "party games",
    "phone as controller",
    "couch co-op",
    "local multiplayer",
    "Windows party game",
    "Jackbox alternative",
    "QR code game",
    "game night",
    "HotTake",
  ],
} as const;

export const nav = [
  { href: "/games", label: "Games" },
  { href: "/how-to-play", label: "How to play" },
  { href: "/creator", label: "Creator" },
  { href: "/download", label: "Download" },
] as const;

export function absoluteUrl(path = "/"): string {
  return `${site.url}${path.startsWith("/") ? path : `/${path}`}`;
}
