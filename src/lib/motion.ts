"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { Flip } from "gsap/Flip";
import { useGSAP } from "@gsap/react";

let registered = false;

/** Registers every GSAP plugin the site uses, once, on the client. */
export function registerGsap() {
  if (registered || typeof window === "undefined") return;
  gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText, ScrambleTextPlugin, Flip);
  gsap.defaults({ ease: "expo.out", duration: 0.9 });
  // Dev-only handle for debugging timelines from the console.
  if (process.env.NODE_ENV === "development") (window as unknown as { gsap: typeof gsap }).gsap = gsap;
  registered = true;
}

/** Pure check, testable: animations run unless the visitor asked for reduced motion. */
export function motionAllowed(prefersReduced: boolean): boolean {
  return !prefersReduced;
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** background-clip:text doesn't reach split words, so copy the gradient class onto each one. */
export function keepGradientWords(words: Element[]) {
  for (const w of words) if (w.parentElement?.closest(".text-gradient-ember")) w.classList.add("text-gradient-ember");
}

export function shouldAnimate(): boolean {
  return motionAllowed(prefersReducedMotion());
}

export { gsap, ScrollTrigger, SplitText, Flip, useGSAP };
