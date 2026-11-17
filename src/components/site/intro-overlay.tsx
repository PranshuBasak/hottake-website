"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { INTRO_KEY } from "@/lib/intro";
import { gsap, registerGsap } from "@/lib/motion";
import { playSound } from "@/lib/sound";
import { Logo } from "./logo";

const noSubscribe = () => () => {};
const introOn = () => document.documentElement.classList.contains("intro-on");

/** Counts to 100 while the page settles, then burns away upward. Any key, click or tap skips it. */
export function IntroOverlay() {
  const root = useRef<HTMLDivElement>(null);
  const count = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(true);
  // Set before paint by the inline script in IntroScreen; false for returning visitors.
  const active = useSyncExternalStore(noSubscribe, introOn, () => false);

  useEffect(() => {
    const el = root.current;
    if (!el || !active) return;
    registerGsap();
    el.style.animation = "none"; // the CSS fail-safe is only for when JavaScript never runs
    document.documentElement.style.overflow = "hidden";

    const n = { v: 0 };
    let done = false;
    let closed = false;
    const close = () => {
      if (closed) return;
      closed = true;
      clearTimeout(bail);
      try {
        localStorage.setItem(INTRO_KEY, "1");
      } catch {}
      document.documentElement.classList.remove("intro-on");
      document.documentElement.classList.add("intro-seen");
      document.documentElement.style.overflow = "";
      setShow(false);
    };
    // Never trap anyone: timers keep running when animation frames stall (background tab, busy GPU).
    const bail = setTimeout(close, 6000);
    const finish = () => {
      if (done) return;
      done = true;
      try {
        localStorage.setItem(INTRO_KEY, "1");
      } catch {}
      tl.kill();
      gsap
        .timeline({ onComplete: close })
        .to(el.querySelector("[data-intro-card]"), { scale: 0.92, autoAlpha: 0, duration: 0.35, ease: "power2.in" })
        .to(el, { clipPath: "inset(0% 0% 100% 0%)", duration: 0.75, ease: "power4.inOut" }, "<0.15");
    };

    const loaded = new Promise<void>((r) => (document.readyState === "complete" ? r() : addEventListener("load", () => r(), { once: true })));
    const tl = gsap.timeline();
    tl.from(el.querySelector("[data-intro-logo]"), { y: 24, autoAlpha: 0, scale: 0.8, duration: 0.6, ease: "back.out(2)" })
      .from(el.querySelectorAll("[data-intro-fade]"), { y: 10, autoAlpha: 0, stagger: 0.08, duration: 0.4 }, "<0.2")
      .to(n, {
        v: 100,
        duration: 1.5,
        ease: "power2.inOut",
        onUpdate: () => {
          const v = Math.round(n.v);
          if (count.current) count.current.textContent = String(v).padStart(3, "0");
          if (bar.current) bar.current.style.transform = `scaleX(${v / 100})`;
        },
      }, "<");
    // Leave once the count has finished and the page has loaded (waiting at most 2.5s for the load).
    Promise.all([tl.then(), Promise.race([loaded, new Promise((r) => setTimeout(r, 2500))])]).then(finish);

    const skip = (e: Event) => {
      if (e.type === "keydown" && (e as KeyboardEvent).key === "Tab") return;
      playSound("intro");
      finish();
    };
    addEventListener("keydown", skip);
    el.addEventListener("pointerdown", skip);
    return () => {
      clearTimeout(bail);
      removeEventListener("keydown", skip);
      el.removeEventListener("pointerdown", skip);
      document.documentElement.style.overflow = "";
    };
  }, [active]);

  if (!show) return null;
  return (
    <div
      ref={root}
      id="intro"
      role="status"
      aria-label="Loading HotTake"
      className="fixed inset-0 z-[150] grid cursor-pointer place-items-center overflow-hidden bg-bg-0"
    >
      {/* CSS embers: the ASCII flame player is too heavy to run during the first load. */}
      <div aria-hidden className="intro-embers absolute inset-x-0 bottom-0 h-[70%]" />
      <div className="absolute inset-0 bg-[radial-gradient(55%_45%_at_50%_50%,rgba(18,13,11,0.92),rgba(18,13,11,0.35)_70%,transparent)]" />
      <div data-intro-card className="relative flex w-[min(88vw,22rem)] flex-col items-center gap-5 rounded-3xl border border-white/10 bg-bg-0/80 px-8 py-8 shadow-2xl backdrop-blur-md">
        <span data-intro-logo className="inline-block scale-[1.6]">
          <Logo />
        </span>
        <p data-intro-fade className="mt-2 text-center text-sm text-muted-foreground">
          Warming up the party
        </p>
        <div data-intro-fade className="w-full">
          <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
            <div ref={bar} className="h-full origin-left scale-x-0 rounded-full bg-gradient-to-r from-ember to-amber" />
          </div>
          <div className="mt-2 flex justify-between font-mono text-xs text-muted-foreground">
            <span>press any key to skip</span>
            <span>
              <span ref={count} className="tabular-nums text-foreground">
                000
              </span>
              %
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
