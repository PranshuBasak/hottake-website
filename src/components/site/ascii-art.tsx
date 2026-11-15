"use client";

import { createElement, useEffect, useRef, useState } from "react";

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
};

/**
 * Thin React wrapper around the `<ascii-art>` custom element from ascii-magic-art (runtime loaded once in
 * the root layout). The element only exists while it is on screen, so offscreen pieces cost nothing, and
 * it is drawn as a still frame when the visitor asked for reduced motion.
 */
export function AsciiArt({ piece, size = 10, speed, look, bg, still, className, style, eager }: AsciiArtProps) {
  const box = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(!!eager);

  useEffect(() => {
    if (eager || !box.current) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "120px" });
    io.observe(box.current);
    return () => io.disconnect();
  }, [eager]);

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
          class: "block h-full w-full",
        })}
    </div>
  );
}
