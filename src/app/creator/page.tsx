import type { Metadata } from "next";
import Image from "next/image";
import { Mail } from "lucide-react";
import { AsciiArt } from "@/components/site/ascii-art";
import { GithubIcon, LinkedinIcon } from "@/components/site/brand-icons";
import { Reveal, SplitHeading } from "@/components/site/reveal";
import { ShaderBg } from "@/components/site/shader-bg";
import { SubscribeForm } from "@/components/site/subscribe-form";
import { creator } from "@/data/creator";
import { getGames } from "@/lib/games";
import { JsonLd, breadcrumbLd, personLd } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: `${creator.name} — the developer behind HotTake`,
  description: `Meet ${creator.name}, who built HotTake: a Rust + WebRTC party-game console that turns any Windows laptop and a room full of phones into game night.`,
  alternates: { canonical: "/creator" },
  openGraph: { url: "/creator", images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "HotTake" }], type: "profile", title: `${creator.name} · HotTake` },
};

export default function CreatorPage() {
  const games = getGames();
  const ports = games.filter((g) => g.credit).length;
  const stats = [
    { n: games.length, l: "games shipped" },
    { n: games.length - ports, l: "original designs" },
    { n: ports, l: "credited ports" },
    { n: 4, l: "release waves" },
  ];

  return (
    <>
      <JsonLd data={[personLd(), breadcrumbLd([{ name: "Home", path: "/" }, { name: "Creator", path: "/creator" }])]} />
      <section className="grain relative isolate overflow-hidden pt-36 pb-20">
        <ShaderBg variant="dusk" />
        <div className="container-site relative grid items-center gap-12 lg:grid-cols-[1fr_auto]">
          <div>
            <p className="eyebrow mb-4">{creator.role}</p>
            <SplitHeading as="h1" onScroll={false} className="text-5xl font-extrabold sm:text-8xl">
              {creator.name}
            </SplitHeading>
            <p className="mt-6 max-w-2xl text-xl text-muted-foreground">{creator.bio[0]}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={site.creator.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex h-12 items-center gap-2 rounded-full bg-[#0a66c2] px-6 font-semibold text-white transition-transform hover:-translate-y-0.5">
                <LinkedinIcon className="size-4" /> LinkedIn
              </a>
              <a href={site.creator.github} target="_blank" rel="noopener noreferrer" className="inline-flex h-12 items-center gap-2 rounded-full border border-border px-6 font-semibold hover:border-white/30">
                <GithubIcon className="size-4" /> GitHub
              </a>
              <a href={`mailto:${site.creator.email}`} className="inline-flex h-12 items-center gap-2 rounded-full border border-border px-6 font-semibold hover:border-white/30">
                <Mail className="size-4" aria-hidden /> Email
              </a>
            </div>
          </div>
          <div className="relative mx-auto size-64 overflow-hidden rounded-full border border-amber/30 bg-bg-1 shadow-[0_40px_100px_-30px_#ff6b4f] sm:size-80">
            {creator.photo ? (
              <Image src={creator.photo} alt={creator.name} fill sizes="320px" className="object-cover" priority />
            ) : (
              <AsciiArt cover piece="lcd-handheld-game" size={9} className="absolute inset-0 overflow-hidden h-full w-full" />
            )}
          </div>
        </div>
      </section>

      <section className="container-site py-12">
        <Reveal as="ul" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((s) => (
            <li key={s.l} className="rounded-3xl border border-border bg-bg-1 p-6">
              <p className="font-heading text-5xl font-extrabold text-gradient-ember">{s.n}</p>
              <p className="mt-1 text-muted-foreground">{s.l}</p>
            </li>
          ))}
        </Reveal>
      </section>

      <section className="container-site grid gap-12 py-16 lg:grid-cols-[1.2fr_1fr]">
        <Reveal>
          <h2 className="text-3xl font-bold">Why HotTake exists</h2>
          {creator.bio.slice(1).map((p) => (
            <p key={p.slice(0, 20)} className="mt-4 text-lg leading-relaxed text-muted-foreground">
              {p}
            </p>
          ))}
          <h3 className="mt-10 text-lg font-bold">Built with</h3>
          <ul className="mt-3 flex flex-wrap gap-2">
            {creator.stack.map((s) => (
              <li key={s} className="rounded-full border border-border bg-bg-1 px-3 py-1 font-mono text-xs">
                {s}
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal as="ol" className="relative space-y-8 border-l border-border pl-8">
          {creator.timeline.map((t) => (
            <li key={t.title} className="relative">
              <span className="absolute top-1.5 -left-[37px] size-3 rounded-full border-2 border-ember bg-bg-0" />
              <p className="eyebrow text-muted-foreground">{t.date}</p>
              <h3 className="mt-1 text-xl font-bold">{t.title}</h3>
              <p className="mt-1 text-muted-foreground">{t.body}</p>
            </li>
          ))}
        </Reveal>
      </section>

      <section className="container-site py-16">
        <div className="rounded-[2rem] border border-border bg-bg-1 p-8 sm:p-12">
          <h2 className="text-3xl font-bold">Follow what&apos;s next</h2>
          <p className="mt-2 max-w-xl text-muted-foreground">New games, new features, and the Mac version if it happens. One email per release, nothing else.</p>
          <SubscribeForm source="creator" className="mt-6" />
        </div>
      </section>
    </>
  );
}
