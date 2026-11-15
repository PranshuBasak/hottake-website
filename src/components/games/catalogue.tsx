"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { Search, Users, X } from "lucide-react";
import { SegmentedControl } from "@/components/interior/segmented-control";
import { track } from "@/components/site/tracker";
import { controlsLabel, fitsPlayers, playersLabel, type Game } from "@/lib/games";
import { Flip, gsap, registerGsap, shouldAnimate, useGSAP } from "@/lib/motion";
import { cn } from "@/lib/utils";

registerGsap();

const MODES = [
  { value: "all", label: "All" },
  { value: "versus", label: "Versus" },
  { value: "coop", label: "Co-op" },
];
const COUNTS = [
  { value: "any", label: "Any" },
  ...[2, 3, 4, 5, 6, 8].map((n) => ({ value: String(n), label: n === 8 ? "8" : String(n) })),
];

export function Catalogue({ games, tags }: { games: Game[]; tags: string[] }) {
  const [mode, setMode] = useState("all");
  const [count, setCount] = useState("any");
  const [tag, setTag] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const grid = useRef<HTMLUListElement>(null);
  const flipState = useRef<Flip.FlipState | null>(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return games.filter(
      (g) =>
        (mode === "all" || (mode === "coop" ? g.coop : !g.coop)) &&
        (count === "any" || fitsPlayers(g, Number(count))) &&
        (!tag || g.tags.includes(tag)) &&
        (!q || `${g.name} ${g.tagline} ${g.tags.join(" ")}`.toLowerCase().includes(q)),
    );
  }, [games, mode, count, tag, query]);

  // Capture positions before React re-renders, animate after.
  const change = (fn: () => void, label: string) => {
    if (grid.current && shouldAnimate()) flipState.current = Flip.getState(grid.current.querySelectorAll("[data-game]"));
    fn();
    track("filter_games", { label });
  };

  useGSAP(
    () => {
      const state = flipState.current;
      if (!state || !grid.current) return;
      flipState.current = null;
      Flip.from(state, {
        targets: grid.current.querySelectorAll("[data-game]"),
        duration: 0.6,
        ease: "expo.out",
        absolute: true,
        scale: true,
        onEnter: (els) => gsap.fromTo(els, { autoAlpha: 0, scale: 0.85 }, { autoAlpha: 1, scale: 1, duration: 0.5, ease: "expo.out" }),
        onLeave: (els) => gsap.to(els, { autoAlpha: 0, scale: 0.85, duration: 0.3 }),
      });
    },
    { dependencies: [visible], scope: grid },
  );

  useGSAP(
    () => {
      if (!shouldAnimate()) return;
      gsap.from("[data-game]", { y: 40, autoAlpha: 0, stagger: 0.03, duration: 0.9, ease: "expo.out", delay: 0.15 });
    },
    { scope: grid },
  );

  const reset = () =>
    change(() => {
      setMode("all");
      setCount("any");
      setTag(null);
      setQuery("");
    }, "reset");

  return (
    <div>
      <div className="sticky top-20 z-30 -mx-4 mb-8 space-y-4 border-y border-border bg-bg-0/85 px-4 py-4 backdrop-blur-xl sm:mx-0 sm:rounded-2xl sm:border">
        <div className="flex flex-wrap items-center gap-3">
          <SegmentedControl options={MODES} label="Game type" value={mode} onValueChange={(v) => change(() => setMode(v), `mode:${v}`)} className="w-full sm:w-64" />
          <div className="flex items-center gap-2">
            <Users className="size-4 text-muted-foreground" aria-hidden />
            <SegmentedControl options={COUNTS} label="Number of players" value={count} onValueChange={(v) => change(() => setCount(v), `players:${v}`)} className="w-[280px]" />
          </div>
          <label className="relative ml-auto w-full sm:w-64">
            <span className="sr-only">Search games</span>
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => change(() => setQuery(e.target.value), "search")}
              placeholder="Search 32 games"
              className="h-10 w-full rounded-full border border-border bg-bg-1 pr-4 pl-9 text-sm outline-none focus:border-amber"
            />
          </label>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]" role="group" aria-label="Filter by tag">
          {tags.map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={tag === t}
              onClick={() => change(() => setTag(tag === t ? null : t), `tag:${t}`)}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1 text-xs capitalize transition-colors",
                tag === t ? "border-amber bg-amber/15 text-amber" : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <p className="mb-5 text-sm text-muted-foreground" aria-live="polite">
        {visible.length === games.length ? `All ${games.length} games` : `${visible.length} of ${games.length} games`}
        {visible.length !== games.length && (
          <button type="button" onClick={reset} className="ml-3 inline-flex items-center gap-1 text-amber hover:text-foreground">
            <X className="size-3.5" aria-hidden /> Clear filters
          </button>
        )}
      </p>

      <h2 className="sr-only">Games</h2>
      <ul ref={grid} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((g) => (
          <li key={g.id} data-game data-flip-id={g.id}>
            <GameCard game={g} />
          </li>
        ))}
      </ul>
      {visible.length === 0 && (
        <div className="rounded-3xl border border-dashed border-border p-12 text-center text-muted-foreground">
          No game matches that mix. <button type="button" onClick={reset} className="text-amber underline underline-offset-4">Clear filters</button>
        </div>
      )}
    </div>
  );
}

export function GameCard({ game: g }: { game: Game }) {
  const card = useRef<HTMLAnchorElement>(null);
  // Subtle 3D tilt toward the pointer.
  const onMove = (e: React.PointerEvent) => {
    if (!card.current || e.pointerType !== "mouse" || !shouldAnimate()) return;
    const r = card.current.getBoundingClientRect();
    gsap.to(card.current, {
      rotateY: ((e.clientX - r.left) / r.width - 0.5) * 8,
      rotateX: -((e.clientY - r.top) / r.height - 0.5) * 8,
      duration: 0.5,
      ease: "power3.out",
    });
  };
  const onLeave = () => card.current && gsap.to(card.current, { rotateX: 0, rotateY: 0, duration: 0.8, ease: "elastic.out(1,0.5)" });

  return (
    <div className="[perspective:900px]">
      <Link
        ref={card}
        href={`/games/${g.id}`}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        className="group block overflow-hidden rounded-3xl border border-border bg-bg-1 transition-[border-color,box-shadow] duration-500 [transform-style:preserve-3d] hover:border-white/20 hover:shadow-[0_30px_60px_-30px_#ff6b4f80]"
      >
        <div className="relative aspect-[16/9] overflow-hidden">
          <Image src={g.thumb} alt={`${g.name} cover art`} fill unoptimized sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute top-3 left-3 flex gap-1.5">
            {g.coop && <span className="rounded-full bg-ok/90 px-2.5 py-0.5 text-xs font-bold text-[#0d1f15]">Co-op</span>}
            {g.credit && <span className="rounded-full bg-bg-0/80 px-2.5 py-0.5 text-xs backdrop-blur">Port</span>}
          </div>
        </div>
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-heading text-xl font-bold">{g.name}</h3>
            <span className="mt-1 shrink-0 rounded-full bg-bg-3 px-2.5 py-0.5 text-xs text-muted-foreground">{playersLabel(g)} players</span>
          </div>
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{g.tagline}</p>
          <p className="mt-4 font-mono text-[11px] tracking-wide text-amber/80 uppercase">{controlsLabel(g)}</p>
        </div>
      </Link>
    </div>
  );
}
