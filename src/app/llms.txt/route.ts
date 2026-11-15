import { docHref, docsPages } from "@/lib/docs";
import { getGames, playersLabel } from "@/lib/games";
import { absoluteUrl, site } from "@/lib/site";

/** /llms.txt (llmstxt.org): a plain-text map of the site for AI assistants and crawlers. Static at build time. */
export function GET() {
  const docs = docsPages();
  const sections = [...new Set(docs.map((d) => d.section))];
  const lines = [
    `# ${site.name}`,
    "",
    `> ${site.description}`,
    "",
    "HotTake is a free Windows desktop app. The laptop runs the host and shows the game; players join by scanning a QR code and use their phone's browser as the controller. No app install, no account, no game server. Games are sandboxed web bundles that talk to the platform through a small SDK.",
    "",
    "## Pages",
    "",
    `- [Home](${absoluteUrl("/")}): what HotTake is and how it works`,
    `- [Games](${absoluteUrl("/games")}): the ${getGames().length} built-in games`,
    `- [How to play](${absoluteUrl("/how-to-play")}): setup, controls, tournaments, online play, troubleshooting and FAQ`,
    `- [Download](${absoluteUrl("/download")}): the Windows installer, checksum and requirements`,
    `- [Creator](${absoluteUrl("/creator")}): ${site.creator.name}, who built HotTake`,
    `- [Status](${absoluteUrl("/health")}): live website status`,
    "",
    ...sections.flatMap((section) => [
      `## Docs: ${section}`,
      "",
      ...docs.filter((d) => d.section === section).map((d) => `- [${d.title}](${absoluteUrl(docHref(d.slug))}): ${d.description}`),
      "",
    ]),
    "## Games",
    "",
    ...getGames().map((g) => `- [${g.name}](${absoluteUrl(`/games/${g.id}`)}): ${g.tagline} (${playersLabel(g)} players${g.coop ? ", co-op" : ""})`),
    "",
    "## Optional",
    "",
    `- [Privacy policy](${absoluteUrl("/privacy")})`,
    `- [Terms of use](${absoluteUrl("/terms")})`,
    `- [Website source code](https://github.com/PranshuBasak/hottake-website)`,
    "",
  ];
  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
