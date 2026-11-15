"use client";

import { useRef } from "react";
import { gsap, keepGradientWords, registerGsap, shouldAnimate, SplitText, useGSAP } from "@/lib/motion";
import { cn } from "@/lib/utils";

registerGsap();

/**
 * Fades and lifts its `[data-reveal]` descendants (or its direct children) in as they scroll into view.
 */
export function Reveal({
  children,
  className,
  as: Tag = "div",
  stagger = 0.08,
  y = 36,
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section" | "ul" | "ol";
  stagger?: number;
  y?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      if (!shouldAnimate() || !ref.current) return;
      const marked = ref.current.querySelectorAll<HTMLElement>("[data-reveal]");
      const targets = marked.length ? Array.from(marked) : Array.from(ref.current.children);
      gsap.from(targets, {
        y,
        autoAlpha: 0,
        duration: 1,
        stagger,
        ease: "expo.out",
        scrollTrigger: { trigger: ref.current, start: "top 85%", once: true },
      });
    },
    { scope: ref },
  );
  return (
    <Tag ref={ref as React.Ref<never>} className={className}>
      {children}
    </Tag>
  );
}

/** Headline that rises in word by word (SplitText), on load, or on scroll with `onScroll`. */
export function SplitHeading({
  children,
  className,
  as: Tag = "h2",
  onScroll = true,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3";
  onScroll?: boolean;
  delay?: number;
}) {
  const ref = useRef<HTMLHeadingElement>(null);
  useGSAP(
    () => {
      if (!ref.current) return;
      if (!shouldAnimate()) return;
      // Above the fold (onScroll false) the heading is usually the LCP element: keep it painted and only slide/brighten.
      const split = onScroll
        ? SplitText.create(ref.current, { type: "words,lines", mask: "lines", linesClass: "pb-[0.12em] -mb-[0.12em]" })
        : SplitText.create(ref.current, { type: "words" });
      keepGradientWords(split.words);
      gsap.from(split.words, {
        ...(onScroll ? { yPercent: 110, rotate: 4 } : { y: "0.3em", rotate: 2, color: "#5a4a40" }),
        duration: 1.1,
        stagger: 0.045,
        delay,
        ease: "expo.out",
        ...(onScroll ? { scrollTrigger: { trigger: ref.current, start: "top 88%", once: true } } : {}),
      });
      return () => split.revert();
    },
    { scope: ref },
  );
  return (
    <Tag ref={ref} className={cn(className)}>
      {children}
    </Tag>
  );
}
