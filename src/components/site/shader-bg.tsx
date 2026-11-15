"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";

const Canvas = dynamic(() => import("./shader-canvas"), { ssr: false });

export type ShaderVariant = "hero" | "ember" | "dusk";

/**
 * Becomes true on the visitor's first interaction (pointer move, scroll, touch or key), so the WebGL scene
 * and its three.js bundle never compete with first paint. One shared flag for every ShaderBg on the page.
 */
let idle = false;
const idleListeners = new Set<() => void>();
function subscribeIdle(fn: () => void) {
  idleListeners.add(fn);
  if (!idle && idleListeners.size === 1) {
    const go = () => {
      idle = true;
      idleListeners.forEach((l) => l());
    };
    const events = ["pointermove", "scroll", "touchstart", "keydown"] as const;
    const first = () => {
      events.forEach((e) => removeEventListener(e, first));
      ("requestIdleCallback" in window ? requestIdleCallback : setTimeout)(go);
    };
    events.forEach((e) => addEventListener(e, first, { once: true, passive: true }));
  }
  return () => idleListeners.delete(fn);
}

/** Desktop-class device, WebGL2 present, motion allowed, not on data-saver. Evaluated once per page load. */
let cachedLive: boolean | null = null;
function canAnimate(): boolean {
  if (!idle) return false;
  if (cachedLive !== null) return cachedLive;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const desktop = window.matchMedia("(min-width: 768px) and (pointer: fine)").matches && (navigator.hardwareConcurrency ?? 4) >= 4;
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  let gl = false;
  try {
    gl = !!document.createElement("canvas").getContext("webgl2");
  } catch {
    gl = false;
  }
  cachedLive = desktop && !reduce && !conn?.saveData && gl;
  return cachedLive;
}

/**
 * Animated ShaderGradient background. A static CSS gradient is always painted underneath,
 * so the section never looks empty: before WebGL loads, without WebGL, under reduced motion,
 * or on data-saver connections the static layer is all you see.
 */
export function ShaderBg({ variant = "hero", className }: { variant?: ShaderVariant; className?: string }) {
  const live = useSyncExternalStore(subscribeIdle, canAnimate, () => false);

  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <div className={cn("absolute inset-0", STATIC[variant])} />
      {live && <Canvas variant={variant} />}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,var(--bg-0)_0%,color-mix(in_oklab,var(--bg-0)_55%,transparent)_45%,transparent_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,var(--bg-0)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-bg-0" />
    </div>
  );
}

const STATIC: Record<ShaderVariant, string> = {
  hero: "bg-[radial-gradient(60%_60%_at_70%_30%,#ff6b4f55,transparent),radial-gradient(50%_50%_at_20%_70%,#ffa94d40,transparent),radial-gradient(40%_40%_at_80%_80%,#ff7ad930,transparent)]",
  ember: "bg-[radial-gradient(70%_60%_at_50%_100%,#ff6b4f50,transparent),radial-gradient(40%_40%_at_10%_20%,#ffa94d30,transparent)]",
  dusk: "bg-[radial-gradient(60%_60%_at_30%_30%,#b18cff30,transparent),radial-gradient(60%_60%_at_80%_70%,#ff6b4f40,transparent)]",
};
