"use client";

import { createElement } from "react";

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
};

/**
 * Thin React wrapper around the `<ascii-art>` custom element from ascii-magic-art.
 * The element script is loaded once in the root layout (see AsciiRuntime).
 */
export function AsciiArt({ piece, size = 10, speed, look, bg, still, className, style }: AsciiArtProps) {
  return createElement("ascii-art", {
    piece,
    size: String(size),
    ...(speed !== undefined ? { speed: String(speed) } : {}),
    ...(look ? { look } : {}),
    ...(bg ? { bg } : {}),
    ...(still ? { still: "" } : {}),
    class: className,
    style,
    "aria-hidden": "true",
  });
}
