import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download, ExternalLink, Gamepad2, Users } from "lucide-react";
import { GameCard } from "@/components/games/catalogue";
import { Reveal, SplitHeading } from "@/components/site/reveal";
import { ShaderBg } from "@/components/site/shader-bg";
import { controlsLabel, getGame, getGames, playersLabel } from "@/lib/games";
import { JsonLd, breadcrumbLd, gameLd } from "@/lib/seo";

/** Cuts at a word boundary so search snippets never end mid-word. */
const clip = (s: string, n: number) => (s.length <= n ? s : `${s.slice(0, s.lastIndexOf(" ", n - 1))}…`);

export function generateStaticParams() {
  return getGames().map((g) => ({ id: g.id }));
}

export async function generateMetadata({ params }: PageProps<"/games/[id]">): Promise<Metadata> {
  const { id } = await params;
  const g = getGame(id);
  if (!g) return {};
  const players = `${playersLabel(g)} players`;
  return {
    title: `${g.name} — ${g.coop ? "co-op" : "party"} game for ${players}`,
    description: clip(`${g.tagline} Play ${g.name} in HotTake with phones as controllers (${players}, ${controlsLabel(g)}).`, 158),
    alternates: { canonical: `/games/${g.id}` },
    keywords: [g.name, ...g.tags, "phone controller game", "HotTake"],
    openGraph: { url: `/games/${g.id}`, title: `${g.name} · HotTake`, description: g.tagline, type: "article" },
  };
}

const LICENSE_NAMES: Record<string, string> = {
  MIT: "MIT License",
  "BSD-3-Clause": "BSD 3-Clause License",
  "CC-BY-4.0": "Creative Commons Attribution 4.0",
  permission: "Used with the author's permission",
};

export default async function GamePage({ params }: PageProps<"/games/[id]">) {
  const { id } = await params;
  const g = getGame(id);
  if (!g) notFound();

  const all = getGames();
  const related = all
    .filter((o) => o.id !== g.id && o.tags.some((t) => t !== "party" && g.tags.includes(t)))
    .slice(0, 3);
  const more = related.length >= 3 ? related : [...related, ...all.filter((o) => o.id !== g.id && !related.includes(o))].slice(0, 3);

  const facts = [
    { icon: Users, label: "Players", value: `${playersLabel(g)}${g.coop ? " · co-op" : ""}` },
    { icon: Gamepad2, label: "Phone controls", value: controlsLabel(g) },
  ];

  return (
    <>
      <JsonLd
        data={[
          gameLd(g),
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Games", path: "/games" },
            { name: g.name, path: `/games/${g.id}` },
          ]),
        ]}
      />
      <section className="grain relative isolate overflow-hidden pt-32 pb-16">
        <ShaderBg variant="dusk" />
        <div className="container-site relative">
          <Link href="/games" className="group mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" aria-hidden /> All games
          </Link>
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.1fr]">
            <div>
              <div className="mb-4 flex flex-wrap gap-2">
                {g.tags.map((t) => (
                  <span key={t} className="rounded-full border border-border bg-bg-0/50 px-3 py-0.5 text-xs capitalize text-muted-foreground">
                    {t}
                  </span>
                ))}
              </div>
              <SplitHeading as="h1" onScroll={false} className="text-5xl font-extrabold sm:text-7xl">
                {g.name}
              </SplitHeading>
              <p className="mt-5 text-xl text-muted-foreground">{g.tagline}</p>
              <dl className="mt-8 grid gap-3 sm:grid-cols-2">
                {facts.map((f) => (
                  <div key={f.label} className="rounded-2xl border border-border bg-bg-1/70 p-4 backdrop-blur">
                    <dt className="flex items-center gap-2 text-xs tracking-wider text-muted-foreground uppercase">
                      <f.icon className="size-3.5" aria-hidden /> {f.label}
                    </dt>
                    <dd className="mt-1 font-semibold">{f.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="relative aspect-[16/9] overflow-hidden rounded-3xl border border-border shadow-[0_40px_100px_-40px_#ff6b4f99]">
              <Image src={g.cover} alt={`${g.name} cover art`} fill priority unoptimized className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      <section className="container-site grid gap-12 py-16 lg:grid-cols-[1.4fr_1fr]">
        <Reveal>
          <h2 className="text-3xl font-bold">How to play {g.name}</h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{g.description}</p>
          <ol className="mt-8 space-y-4">
            {[
              "Start HotTake on the laptop and have everyone scan the QR code.",
              `Make sure ${playersLabel(g)} players are in the lobby${g.players.min > 1 ? ` (at least ${g.players.min})` : ""}.`,
              `The leader picks ${g.name} on the shelf and presses Play.`,
              `Your phone switches to this game's controls: ${controlsLabel(g)}.`,
            ].map((step, i) => (
              <li key={step} className="flex gap-4">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-ember/15 font-mono text-sm text-ember">{i + 1}</span>
                <span className="pt-1">{step}</span>
              </li>
            ))}
          </ol>
        </Reveal>
        <Reveal className="space-y-5">
          <div className="rounded-3xl border border-border bg-bg-1 p-6">
            <h2 className="text-lg font-bold">Ready to play?</h2>
            <p className="mt-2 text-sm text-muted-foreground">{g.name} comes with HotTake, along with {getGames().length - 1} other games.</p>
            <a
              href="/api/download"
              data-track="download_click"
              data-track-label={`game:${g.id}`}
              data-no-transition
              className="mt-5 flex h-12 items-center justify-center gap-2 rounded-full bg-ember font-semibold text-[#1a120d] transition-colors hover:bg-amber"
            >
              <Download className="size-4" aria-hidden /> Download HotTake
            </a>
          </div>
          {g.credit && (
            <div className="rounded-3xl border border-border bg-bg-1 p-6">
              <h2 className="text-lg font-bold">Credits</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {g.name} is ported to HotTake from{" "}
                {g.credit.url ? (
                  <a href={g.credit.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-amber underline-offset-4 hover:underline">
                    the original by {g.credit.author} <ExternalLink className="size-3" aria-hidden />
                  </a>
                ) : (
                  `the original by ${g.credit.author}`
                )}
                .
              </p>
              {g.credit.license && <p className="mt-2 text-sm">Licence: {LICENSE_NAMES[g.credit.license] ?? g.credit.license}</p>}
              {g.credit.notes && <p className="mt-2 text-xs text-muted-foreground">{g.credit.notes}</p>}
            </div>
          )}
        </Reveal>
      </section>

      <section className="container-site pb-10" aria-labelledby="more-title">
        <h2 id="more-title" className="mb-6 text-2xl font-bold">
          If you like {g.name}
        </h2>
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {more.map((o) => (
            <li key={o.id}>
              <GameCard game={o} />
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
