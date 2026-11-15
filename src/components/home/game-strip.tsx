"use client";

import Link from "next/link";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import { SplitHeading } from "@/components/site/reveal";
import { gsap, registerGsap, ScrollTrigger, shouldAnimate, useGSAP } from "@/lib/motion";
import type { Game } from "@/lib/games";
import { playersLabel } from "@/lib/games";

registerGsap();

export type StripGame = Pick<Game, "id" | "name" | "thumb" | "players">;

/**
 * Two rows of game cards drifting in opposite directions.
 *
 * Built to stay cheap while it moves:
 * - one GSAP tween per row on a GPU layer (translate3d + will-change), nothing else animates per frame;
 * - small pre-rendered WebP thumbnails instead of detailed SVG covers;
 * - edge fades are two static overlays, not a mask over the moving layer (a mask repaints every frame);
 * - the copy each loop needs is cloned in the browser, and the rows only run while on screen.
 * Hover or focus pauses a row. Reduced motion shows a still, scrollable row.
 */
export function GameStrip({ games }: { games: StripGame[] }) {
  const root = useRef<HTMLElement>(null);
  const half = Math.ceil(games.length / 2);
  const rows = [games.slice(0, half), games.slice(half)];

  useGSAP(
    () => {
      if (!shouldAnimate()) return;
      const tracks = gsap.utils.toArray<HTMLElement>("[data-track-row]");

      tracks.forEach((t) => {
        if (t.dataset.cloned) return;
        t.dataset.cloned = "1";
        Array.from(t.children).forEach((card) => {
          const copy = card.cloneNode(true) as HTMLElement;
          copy.dataset.clone = "1";
          copy.setAttribute("aria-hidden", "true");
          copy.querySelectorAll("a").forEach((a) => a.setAttribute("tabindex", "-1"));
          copy.querySelectorAll("img").forEach((img) => img.setAttribute("alt", ""));
          t.appendChild(copy);
        });
      });

      const tweens = tracks.map((t, i) =>
        gsap.fromTo(
          t,
          { xPercent: i % 2 ? -50 : 0, force3D: true },
          { xPercent: i % 2 ? 0 : -50, duration: 70, ease: "none", repeat: -1, paused: true, force3D: true },
        ),
      );

      const st = ScrollTrigger.create({
        trigger: root.current,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => tweens.forEach((tw) => (self.isActive ? tw.play() : tw.pause())),
      });

      const cleanups = tracks.map((t, i) => {
        const tw = tweens[i];
        const slow = () => gsap.to(tw, { timeScale: 0, duration: 0.5, overwrite: true });
        const go = () => gsap.to(tw, { timeScale: 1, duration: 0.5, overwrite: true });
        t.addEventListener("pointerenter", slow);
        t.addEventListener("pointerleave", go);
        t.addEventListener("focusin", slow);
        t.addEventListener("focusout", go);
        return () => {
          t.removeEventListener("pointerenter", slow);
          t.removeEventListener("pointerleave", go);
          t.removeEventListener("focusin", slow);
          t.removeEventListener("focusout", go);
        };
      });

      return () => {
        cleanups.forEach((c) => c());
        st.kill();
        tracks.forEach((t) => {
          t.querySelectorAll("[data-clone]").forEach((c) => c.remove());
          delete t.dataset.cloned;
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

      <div className="relative space-y-5 [contain:layout_paint]">
        {rows.map((row, r) => (
          <div key={r} className="overflow-x-auto [scrollbar-width:none] motion-safe:overflow-hidden">
            <ul data-track-row className="flex w-max will-change-transform">
              {row.map((g) => (
                <li key={g.id} className="mr-5 shrink-0">
                  <Link
                    href={`/games/${g.id}`}
                    className="block w-[240px] overflow-hidden rounded-2xl border border-border bg-bg-1 transition-colors hover:border-white/25 sm:w-[300px]"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- fixed-size local WebP; next/image adds nothing here */}
                    <img
                      src={g.thumb}
                      alt={`${g.name} cover art`}
                      width={300}
                      height={169}
                      loading="lazy"
                      decoding="async"
                      draggable={false}
                      className="aspect-[16/9] w-full object-cover"
                    />
                    <div className="flex items-center justify-between gap-3 p-4">
                      <span className="truncate font-heading text-lg font-bold">{g.name}</span>
                      <span className="shrink-0 rounded-full bg-bg-3 px-2.5 py-0.5 text-xs text-muted-foreground">{playersLabel(g)} players</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        {/* static edge fades (cheap) instead of a mask over the moving rows */}
        <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-bg-0 to-transparent sm:w-28" />
        <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-bg-0 to-transparent sm:w-28" />
      </div>
    </section>
  );
}
