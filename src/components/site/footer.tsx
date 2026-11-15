"use client";

import Link from "next/link";
import { site } from "@/lib/site";
import { AsciiArt } from "./ascii-art";
import { useConsent } from "./consent";
import { Logo } from "./logo";

const columns = [
  {
    title: "Play",
    links: [
      { href: "/games", label: "All 32 games" },
      { href: "/how-to-play", label: "How to play" },
      { href: "/how-to-play#troubleshooting", label: "Troubleshooting" },
      { href: "/download", label: "Download" },
    ],
  },
  {
    title: "About",
    links: [
      { href: "/creator", label: "The creator" },
      { href: site.creator.linkedin, label: "LinkedIn", external: true },
      { href: "/docs", label: "Documentation" },
      { href: "/docs/making-games", label: "Make your own game" },
      { href: "https://github.com/PranshuBasak/hottake-website", label: "Website source", external: true },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy policy" },
      { href: "/terms", label: "Terms of use" },
      { href: "/cookies", label: "Cookies" },
    ],
  },
] as const;

export function Footer() {
  const { openPreferences } = useConsent();
  return (
    <footer className="relative mt-24 overflow-hidden border-t border-border bg-bg-1">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-40 opacity-[0.18] [mask-image:linear-gradient(to_top,black,transparent)]">
        <AsciiArt cover piece="campfire" size={9} className="relative overflow-hidden h-full w-full" />
      </div>
      <div className="container-site relative grid gap-12 py-16 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="space-y-4">
          <Logo />
          <p className="max-w-xs text-sm text-muted-foreground">{site.tagline}</p>
          <p className="text-xs text-muted-foreground">Windows 10/11 · free · v{site.version}</p>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <h2 className="eyebrow mb-4">{col.title}</h2>
            <ul className="space-y-2.5 text-sm">
              {col.links.map((l) => (
                <li key={l.href}>
                  {"external" in l ? (
                    <a href={l.href} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                      {l.label} ↗
                    </a>
                  ) : (
                    <Link href={l.href} className="text-muted-foreground hover:text-foreground">
                      {l.label}
                    </Link>
                  )}
                </li>
              ))}
              {col.title === "Legal" && (
                <li>
                  <button type="button" onClick={openPreferences} className="text-muted-foreground hover:text-foreground">
                    Cookie preferences
                  </button>
                </li>
              )}
            </ul>
          </div>
        ))}
      </div>
      <div className="container-site relative flex flex-col gap-2 border-t border-border py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>
          © 2026 {site.creator.name}. Ported games keep their original licences and credits.
        </p>
        <p>Made with too much coffee and eight phones on one sofa.</p>
      </div>
    </footer>
  );
}
