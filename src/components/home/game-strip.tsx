"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import { SplitHeading } from "@/components/site/reveal";
import { gsap, registerGsap, shouldAnimate, useGSAP } from "@/lib/motion";
import type { Game } from "@/lib/games";
import { playersLabel } from "@/lib/games";

registerGsap();

/** Two rows of covers drifting in opposite directions; scroll speed nudges them. */
export function GameStrip({ games }: { games: Game[] }) {
  const root = useRef<HTMLElement>(null);
  const half = Math.ceil(games.length / 2);
  const rows = [games.slice(0, half), games.slice(half)];

  useGSAP(
    () => {
      if (!shouldAnimate()) return;
      const tracks = gsap.utils.toArray<HTMLElement>("[data-track-row]");
      const tweens = tracks.map((t, i) =>
        gsap.fromTo(t, { xPercent: i % 2 ? -50 : 0 }, { xPercent: i % 2 ? 0 : -50, duration: 60, ease: "none", repeat: -1 }),
      );
      const st = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: "top bottom",
          end: "bottom top",
          onUpdate: (self) => {
            const v = 1 + Math.min(Math.abs(self.getVelocity()) / 400, 5);
            tweens.forEach((tw) => gsap.to(tw, { timeScale: v, duration: 0.2, overwrite: true, onComplete: () => void gsap.to(tw, { timeScale: 1, duration: 1.2 }) }));
          },
        },
      });
      const pause = () => tweens.forEach((t) => gsap.to(t, { timeScale: 0, duration: 0.6 }));
      const play = () => tweens.forEach((t) => gsap.to(t, { timeScale: 1, duration: 0.6 }));
      tracks.forEach((t) => {
        t.addEventListener("pointerenter", pause);
        t.addEventListener("pointerleave", play);
        t.addEventListener("focusin", pause);
        t.addEventListener("focusout", play);
      });
      return () => {
        st.kill();
        tracks.forEach((t) => {
          t.removeEventListener("pointerenter", pause);
          t.removeEventListener("pointerleave", play);
          t.removeEventListener("focusin", pause);
          t.removeEventListener("focusout", play);
        });
      };
    },
    { scope: root },
  );

  return (
    <section ref={root} aria-labelledby="shelf-title" className="relative overflow-hidden py-24">
      <div className="container-site mb-12 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow mb-4">The shelf</p>
          <SplitHeading className="max-w-2xl text-4xl font-extrabold sm:text-6xl">
            <span id="shelf-title">32 games, preloaded. Brawls, bluffs, races and co-op.</span>
          </SplitHeading>
        </div>
        <Link href="/games" className="group inline-flex items-center gap-2 font-semibold text-amber hover:text-foreground">
          See every game <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
        </Link>
      </div>
      <div className="space-y-5 [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
        {rows.map((row, r) => (
          <div key={r} className="flex w-max" data-track-row>
            {[...row, ...row].map((g, i) => (
              <Link
                key={`${g.id}-${i}`}
                href={`/games/${g.id}`}
                tabIndex={i >= row.length ? -1 : undefined}
                aria-hidden={i >= row.length ? true : undefined}
                className="group relative mr-5 block w-[240px] shrink-0 overflow-hidden rounded-2xl border border-border bg-bg-1 sm:w-[300px]"
              >
                <div className="relative aspect-[16/9] overflow-hidden">
                  <Image src={g.cover} alt={`${g.name} cover art`} fill unoptimized className="object-cover transition-transform duration-700 group-hover:scale-110" />
                </div>
                <div className="flex items-center justify-between gap-3 p-4">
                  <span className="truncate font-heading text-lg font-bold">{g.name}</span>
                  <span className="shrink-0 rounded-full bg-bg-3 px-2.5 py-0.5 text-xs text-muted-foreground">{playersLabel(g)} players</span>
                </div>
              </Link>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
