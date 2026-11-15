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

  // cover: fill the box like object-fit: cover.
  // - Default: re-render the piece at a bigger font size, so it stays sharp (no stretched pixels).
  // - eager (the page-transition overlay): scale with a CSS transform instead, which is instant.
  useEffect(() => {
    if (!cover || !visible || !box.current) return;
    const outer = box.current;
    let perPx: { w: number; h: number } | null = null; // natural size per 1px of font size
    let watched: HTMLElement | null = null;
    const fit = () => {
      const el = outer.querySelector<HTMLElement>("ascii-art");
      if (!el) return;
      // Watch the piece itself too: it gets its size only once the runtime has drawn the first frame.
      if (watched !== el) {
        watched = el;
        ro.observe(el);
      }
      if (!perPx) {
        const w = el.scrollWidth, h = el.scrollHeight;
        if (!w || !h) return;
        perPx = { w: w / size, h: h / size };
      }
      const cw = outer.clientWidth, ch = outer.clientHeight;
      if (eager) {
        const s = Math.max(cw / (perPx.w * size), ch / (perPx.h * size));
        el.style.transform = `translate(-50%, -50%) scale(${s})`;
      } else {
        const target = (Math.ceil(Math.max(cw / perPx.w, ch / perPx.h) * 100) / 100).toFixed(2);
        // Changing an attribute restarts the piece, so only touch it when the size really changes.
        if (el.getAttribute("size") !== target) el.setAttribute("size", target);
        el.style.transform = "translate(-50%, -50%)";
      }
    };
    const ro = new ResizeObserver(fit);
    ro.observe(outer);
    // The runtime fills the element a moment after it upgrades, so measure once it is defined and has drawn.
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
  }, [cover, visible, eager, size]);

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
          class: cover ? "absolute top-1/2 left-1/2 block w-max max-w-none origin-center" : "block h-full w-full",
        })}
    </div>
  );
}
