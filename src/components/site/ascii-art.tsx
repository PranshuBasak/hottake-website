"use client";

import { createElement, useEffect, useRef, useState } from "react";

const RUNTIME = "/vendor/ascii-magic/runtime/ascii.js";
let runtime: Promise<void> | null = null;

/** Loads the ascii-magic-art runtime (it defines the <ascii-art> element) once, on first need. */
export function ensureAsciiRuntime(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (!runtime) {
    runtime = new Promise<void>((resolve) => {
      const s = document.createElement("script");
      s.type = "module";
      s.src = RUNTIME;
      s.onload = () => resolve();
      s.onerror = () => resolve();
      document.head.appendChild(s);
    }).then(() => customElements.whenDefined("ascii-art").then(() => undefined));
  }
  return runtime;
}

/** Pieces we use (all MIT, from ascii-magic-art). */
export type AsciiPiece = "fireworks" | "sparks" | "pixel-fire" | "campfire" | "matrix-rain" | string;

export type AsciiArtProps = {
  piece: AsciiPiece;
  size?: number;
  speed?: number;
  look?: "dots" | "ascii" | "binary" | string;
  bg?: string;
  still?: boolean;
  className?: string;
  style?: React.CSSProperties;
  /** Mount immediately instead of waiting to scroll into view (the page-transition overlay uses this). */
  eager?: boolean;
  /** Scale the piece (which renders at its own grid size) so it covers the whole box, like object-fit: cover. */
  cover?: boolean;
};

/**
 * Thin React wrapper around the `<ascii-art>` custom element from ascii-magic-art (runtime loaded once in
 * the root layout). The element only exists while it is on screen, so offscreen pieces cost nothing, and
 * it is drawn as a still frame when the visitor asked for reduced motion.
 */
export function AsciiArt({ piece, size = 10, speed, look, bg, still, className, style, eager, cover }: AsciiArtProps) {
  const box = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(!!eager);

  useEffect(() => {
    if (visible) void ensureAsciiRuntime();
  }, [visible]);

  useEffect(() => {
    if (eager || !box.current) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "120px" });
    io.observe(box.current);
    return () => io.disconnect();
  }, [eager]);

  // cover: measure the piece's natural size and scale it up (centred) until it fills the box.
  useEffect(() => {
    if (!cover || !visible || !box.current) return;
    const outer = box.current;
    let el: HTMLElement | null = null;
    const fit = () => {
      el = outer.querySelector("ascii-art");
      if (!el) return;
      el.style.transform = "none";
      const w = el.scrollWidth, h = el.scrollHeight;
      if (!w || !h) return;
      const s = Math.max(outer.clientWidth / w, outer.clientHeight / h);
      el.style.transform = `translate(-50%, -50%) scale(${s})`;
    };
    const ro = new ResizeObserver(fit);
    ro.observe(outer);
    // The runtime fills the element a moment after it upgrades (and redraws every frame), so re-measure a
    // few times instead of watching mutations.
    let timers: ReturnType<typeof setTimeout>[] = [];
    let alive = true;
    void ensureAsciiRuntime().then(() => {
      if (alive) timers = [0, 50, 150, 400, 900].map((t) => setTimeout(fit, t));
    });
    return () => {
      alive = false;
      ro.disconnect();
      timers.forEach(clearTimeout);
    };
  }, [cover, visible]);

  const reduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <div ref={box} aria-hidden className={className} style={style}>
      {visible &&
        createElement("ascii-art", {
          piece,
          size: String(size),
          ...(speed !== undefined ? { speed: String(speed) } : {}),
          ...(look ? { look } : {}),
          ...(bg ? { bg } : {}),
          ...(still || reduce ? { still: "" } : {}),
          class: cover ? "absolute top-1/2 left-1/2 block origin-center" : "block h-full w-full",
        })}
    </div>
  );
}
