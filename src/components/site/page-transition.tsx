"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { gsap, registerGsap, shouldAnimate } from "@/lib/motion";
import { AsciiArt } from "./ascii-art";

const LABELS: Record<string, string> = {
  "/": "LOBBY",
  "/games": "GAME SHELF",
  "/how-to-play": "HOW TO PLAY",
  "/download": "DOWNLOAD",
  "/creator": "THE CREATOR",
  "/privacy": "PRIVACY",
  "/terms": "TERMS",
  "/cookies": "COOKIES",
};

function labelFor(path: string): string {
  if (LABELS[path]) return LABELS[path];
  if (path.startsWith("/games/")) return path.slice(7).replace(/-/g, " ").toUpperCase();
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
        <AsciiArt piece="pixel-fire" size={14} speed={1.6} className="absolute inset-0 block h-full w-full opacity-80" />
      )}
      <div className="relative flex flex-col items-center gap-3">
        <span className="eyebrow text-amber/80">now loading</span>
        <span ref={label} className="font-mono text-3xl font-bold tracking-[0.3em] text-foreground sm:text-5xl">
          &nbsp;
        </span>
      </div>
    </div>
  );
}
