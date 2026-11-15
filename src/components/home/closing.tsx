"use client";

import Link from "next/link";
import { useRef } from "react";
import { ArrowRight, Download } from "lucide-react";
import { LinkedinIcon } from "@/components/site/brand-icons";
import { AsciiArt } from "@/components/site/ascii-art";
import { Reveal, SplitHeading } from "@/components/site/reveal";
import { ShaderBg } from "@/components/site/shader-bg";
import { SubscribeForm } from "@/components/site/subscribe-form";
import { gsap, registerGsap, shouldAnimate, useGSAP } from "@/lib/motion";
import { site } from "@/lib/site";

registerGsap();

export function CreatorTeaser() {
  return (
    <section aria-labelledby="creator-title" className="container-site py-24">
      <Reveal className="grid items-center gap-10 overflow-hidden rounded-[2rem] border border-border bg-bg-1 p-8 sm:p-12 lg:grid-cols-[auto_1fr]">
        <div data-reveal className="relative mx-auto size-40 overflow-hidden rounded-full border border-amber/30 bg-bg-2 sm:size-48">
          <AsciiArt cover piece="lcd-handheld-game" size={7} className="absolute inset-0 overflow-hidden h-full w-full" />
        </div>
        <div>
          <p data-reveal className="eyebrow mb-3">Made by one person</p>
          <h2 data-reveal id="creator-title" className="text-3xl font-extrabold sm:text-5xl">
            Hi, I&apos;m {site.creator.name}.
          </h2>
          <p data-reveal className="mt-4 max-w-2xl text-lg text-muted-foreground">
            I built HotTake because every party game I liked needed everyone to buy something, install something or sign up for
            something. HotTake needs a laptop and the phones already in your pockets. The Rust host, the phone controller, the SDK and most of the
            32 games are mine; the rest are open-source ports, credited on every page.
          </p>
          <div data-reveal className="mt-6 flex flex-wrap gap-3">
            <Link href="/creator" className="group inline-flex h-11 items-center gap-2 rounded-full bg-secondary px-5 font-semibold hover:bg-bg-3">
              The story <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
            </Link>
            <a
              href={site.creator.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center gap-2 rounded-full border border-border px-5 font-semibold hover:border-[#0a66c2] hover:text-[#4c9bea]"
            >
              <LinkedinIcon className="size-4" /> Connect on LinkedIn
            </a>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

export function FinalCta() {
  const root = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      if (!shouldAnimate()) return;
      gsap.fromTo(
        "[data-cta-card]",
        { clipPath: "inset(12% 10% 12% 10% round 48px)" },
        {
          clipPath: "inset(0% 0% 0% 0% round 32px)",
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top 90%", end: "top 30%", scrub: 0.6 },
        },
      );
    },
    { scope: root },
  );

  return (
    <section ref={root} aria-labelledby="cta-title" className="px-3 py-16">
      <div data-cta-card className="grain relative isolate mx-auto max-w-[1280px] overflow-hidden rounded-[2rem] border border-border px-6 py-20 sm:px-12 sm:py-28">
        <ShaderBg variant="ember" />
        <div className="relative mx-auto max-w-3xl text-center">
          <p className="eyebrow mb-4">Game night, sorted</p>
          <SplitHeading className="text-4xl font-extrabold sm:text-7xl">
            <span id="cta-title">Grab the laptop. Pass the snacks.</span>
          </SplitHeading>
          <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
            Free for Windows 10 and 11. A {site.installerSizeMb} MB installer, nothing to set up on the phones.
          </p>
          <div className="mt-9 flex justify-center">
            <a
              href="/api/download"
              data-track="download_click"
              data-track-label="final-cta"
              data-no-transition
              className="inline-flex h-14 items-center gap-3 rounded-full bg-foreground px-8 text-base font-bold text-[#1a120d] transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
            >
              <Download className="size-5" aria-hidden /> Download HotTake
            </a>
          </div>
          <div className="mx-auto mt-14 max-w-md text-left">
            <p className="mb-3 text-center text-sm font-semibold">Not on Windows tonight? Get an email when new games land.</p>
            <SubscribeForm source="home-cta" />
          </div>
        </div>
      </div>
    </section>
  );
}
