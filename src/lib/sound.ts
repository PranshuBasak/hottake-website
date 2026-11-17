"use client";

/**
 * Tiny synthesized interface sounds (Web Audio, no files). They only play after a user gesture,
 * never on load. Muted state is remembered; people who ask for reduced motion start muted.
 */
export type SoundKind = "click" | "hover" | "vote-up" | "vote-down" | "post" | "error" | "intro";

const KEY = "ht_sound";
const listeners = new Set<() => void>();
let ctx: AudioContext | null = null;
let lastHover = 0;

export function isMuted(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const v = localStorage.getItem(KEY);
    if (v === "on") return false;
    if (v === "off") return true;
  } catch {}
  return typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function setMuted(muted: boolean) {
  try {
    localStorage.setItem(KEY, muted ? "off" : "on");
  } catch {}
  listeners.forEach((l) => l());
  if (!muted) playSound("click");
}

export function subscribeSound(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

type Note = { f: number; t: number; d: number; type?: OscillatorType; g?: number; slide?: number };

const RECIPES: Record<SoundKind, Note[]> = {
  click: [{ f: 880, t: 0, d: 0.05, type: "triangle", g: 0.12 }],
  hover: [{ f: 1320, t: 0, d: 0.03, type: "sine", g: 0.04 }],
  "vote-up": [
    { f: 660, t: 0, d: 0.08, type: "triangle", g: 0.14 },
    { f: 990, t: 0.07, d: 0.12, type: "triangle", g: 0.12 },
  ],
  "vote-down": [{ f: 440, t: 0, d: 0.14, type: "triangle", g: 0.12, slide: 300 }],
  post: [
    { f: 523, t: 0, d: 0.08, type: "square", g: 0.06 },
    { f: 659, t: 0.08, d: 0.08, type: "square", g: 0.06 },
    { f: 784, t: 0.16, d: 0.16, type: "square", g: 0.06 },
  ],
  error: [{ f: 220, t: 0, d: 0.18, type: "sawtooth", g: 0.06, slide: 160 }],
  intro: [
    { f: 392, t: 0, d: 0.1, type: "square", g: 0.05 },
    { f: 523, t: 0.1, d: 0.1, type: "square", g: 0.05 },
    { f: 659, t: 0.2, d: 0.1, type: "square", g: 0.05 },
    { f: 1047, t: 0.3, d: 0.28, type: "triangle", g: 0.08 },
  ],
};

export function playSound(kind: SoundKind) {
  if (typeof window === "undefined" || isMuted()) return;
  if (kind === "hover") {
    const now = performance.now();
    if (now - lastHover < 90) return;
    lastHover = now;
  }
  try {
    ctx ??= new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
    const t0 = ctx.currentTime + 0.005;
    for (const n of RECIPES[kind]) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = n.type ?? "sine";
      osc.frequency.setValueAtTime(n.f, t0 + n.t);
      if (n.slide) osc.frequency.exponentialRampToValueAtTime(n.slide, t0 + n.t + n.d);
      gain.gain.setValueAtTime(0.0001, t0 + n.t);
      gain.gain.exponentialRampToValueAtTime(n.g ?? 0.1, t0 + n.t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + n.t + n.d);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t0 + n.t);
      osc.stop(t0 + n.t + n.d + 0.02);
    }
  } catch {
    // Audio is decoration; never let it break an interaction.
  }
}
