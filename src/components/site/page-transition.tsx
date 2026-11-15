"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { gsap, registerGsap, shouldAnimate } from "@/lib/motion";
import { AsciiArt, ensureAsciiRuntime } from "./ascii-art";

const LABELS: Record<string, string> = {
  "/": "LOBBY",
  "/games": "GAME SHELF",
  "/how-to-play": "HOW TO PLAY",
  "/download": "DOWNLOAD",
  "/creator": "THE CREATOR",
  "/docs": "DOCS",
  "/privacy": "PRIVACY",
  "/terms": "TERMS",
  "/cookies": "COOKIES",
};

function labelFor(path: string): string {
  if (LABELS[path]) return LABELS[path];
  if (path.startsWith("/games/")) return path.slice(7).replace(/-/g, " ").toUpperCase();
  if (path.startsWith("/docs/")) return `DOCS · ${path.slice(6).replace(/-/g, " ").toUpperCase()}`;
  return "LOADING";
}

/**
 * Route changes play an ASCII Magic "pixel-fire" wash: it rises over the page (GSAP clip-path),
 * the route swaps underneath, then it burns away upward. Skipped under reduced motion,
 * for modified clicks, new tabs, downloads, hash links and external links.
 */
export function PageTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const overlay = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState(false);
  const pending = useRef<string | null>(null);

  // Have the ASCII runtime ready before the first navigation: on the first hover/touch of a link, or when idle.
  useEffect(() => {
    const warm = () => void ensureAsciiRuntime();
    const idle = "requestIdleCallback" in window ? requestIdleCallback(warm, { timeout: 4000 }) : setTimeout(warm, 2500);
    addEventListener("pointerover", warm, { once: true, passive: true });
    addEventListener("touchstart", warm, { once: true, passive: true });
    return () => {
      if ("cancelIdleCallback" in window && typeof idle === "number") cancelIdleCallback(idle);
      removeEventListener("pointerover", warm);
      removeEventListener("touchstart", warm);
    };
  }, []);

  useEffect(() => {
    registerGsap();
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement | null)?.closest("a");
      if (!a || a.target === "_blank" || a.hasAttribute("download") || a.dataset.noTransition !== undefined) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname.startsWith("/api/")) return;
      if (url.pathname === location.pathname) return; // same page (or hash link)
      if (!shouldAnimate() || !overlay.current) return;

      e.preventDefault();
      const href = url.pathname + url.search + url.hash;
      pending.current = url.pathname;
      setActive(true);
      gsap.killTweensOf(overlay.current);
      gsap
        .timeline()
        .set(overlay.current, { autoAlpha: 1, clipPath: "inset(100% 0% 0% 0%)" })
        .to(overlay.current, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.55, ease: "power4.inOut" })
        .to(label.current, { duration: 0.5, scrambleText: { text: labelFor(url.pathname), chars: "░▒▓█#*+=-:.", speed: 0.6 } }, "<0.1")
        .add(() => router.push(href));
    };
    // Capture phase: runs before next/link's own handler, which skips navigation once we preventDefault.
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, [router]);

  useEffect(() => {
    if (!pending.current || !overlay.current) return;
    pending.current = null;
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    gsap
      .timeline({ delay: 0.12 })
      .to(overlay.current, { clipPath: "inset(0% 0% 100% 0%)", duration: 0.7, ease: "power4.inOut" })
      .set(overlay.current, { autoAlpha: 0 })
      .add(() => setActive(false));
  }, [pathname]);

  return (
    <div
      ref={overlay}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[100] invisible grid place-items-center overflow-hidden bg-bg-0"
    >
      {active && (
        <AsciiArt eager cover piece="pixel-fire" size={14} speed={1.6} className="absolute inset-0 overflow-hidden opacity-70" />
      )}
      {/* keep the label readable over the brightest flames */}
      <div className="absolute inset-0 bg-[radial-gradient(60%_45%_at_50%_50%,rgba(18,13,11,0.85),rgba(18,13,11,0.25)_70%,transparent)]" />
      <div className="relative flex flex-col items-center gap-3 rounded-3xl border border-white/10 bg-bg-0/80 px-8 py-6 shadow-2xl backdrop-blur-md sm:px-12">
        <span className="eyebrow text-amber">now loading</span>
        <span ref={label} className="font-mono text-3xl font-bold tracking-[0.3em] text-foreground sm:text-5xl">
          &nbsp;
        </span>
      </div>
    </div>
  );
}
