"use client";

import { useRef } from "react";
import { gsap, registerGsap, ScrollTrigger, shouldAnimate, useGSAP } from "@/lib/motion";

registerGsap();

const PLAYERS = [
  { color: "#ff5d73", x: 14, plat: 0 },
  { color: "#3ec1ff", x: 38, plat: 1 },
  { color: "#ffd23f", x: 62, plat: 2 },
  { color: "#7ee081", x: 82, plat: 1 },
];
// platforms: left %, top %, width %
const PLATS = [
  { l: 6, t: 62, w: 26 },
  { l: 30, t: 44, w: 26 },
  { l: 56, t: 62, w: 26 },
];
const COINS = [
  { l: 22, t: 46 },
  { l: 44, t: 28 },
  { l: 70, t: 46 },
  { l: 88, t: 30 },
];

/**
 * A tiny round of "Coin Clash" drawn with divs and animated with GSAP (transforms only):
 * players hop, coins spin and bob, scores tick up. Pauses when off screen.
 */
export function MiniMatch() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!root.current) return;
      const q = gsap.utils.selector(root);
      const scores = q<HTMLElement>("[data-score]");
      if (!shouldAnimate()) return;

      const tl = gsap.timeline({ repeat: -1, paused: true });

      // players: squash, jump, land, each on its own rhythm
      q<HTMLElement>("[data-player]").forEach((p, i) => {
        const jump = gsap
          .timeline({ repeat: -1, repeatDelay: 0.25 + i * 0.12, delay: i * 0.18 })
          .to(p, { scaleY: 0.78, scaleX: 1.15, duration: 0.12, ease: "power1.in", transformOrigin: "50% 100%" })
          .to(p, { y: -46 - (i % 2) * 14, scaleY: 1.12, scaleX: 0.9, duration: 0.34, ease: "power2.out" })
          .to(p, { y: 0, scaleY: 1, scaleX: 1, duration: 0.3, ease: "power2.in" })
          .to(p, { scaleY: 0.86, scaleX: 1.1, duration: 0.08, yoyo: true, repeat: 1 });
        tl.add(jump, 0);
      });

      // coins: bob and spin (scaleX flip reads as a 3D spin)
      q<HTMLElement>("[data-coin]").forEach((c, i) => {
        tl.add(gsap.to(c, { y: -8, duration: 0.9 + i * 0.1, ease: "sine.inOut", yoyo: true, repeat: -1 }), 0);
        tl.add(gsap.to(c, { scaleX: 0.15, duration: 0.5, ease: "sine.inOut", yoyo: true, repeat: -1, delay: i * 0.2 }), 0);
      });

      // scores: count up in turn, with a pop
      const counts = scores.map(() => ({ v: 0 }));
      scores.forEach((s, i) => {
        tl.add(
          gsap.timeline({ repeat: -1, repeatDelay: 1.1 + i * 0.35, delay: 0.6 + i * 0.4 }).add(() => {
            counts[i].v = (counts[i].v + 1) % 20;
            s.textContent = String(counts[i].v);
            gsap.fromTo(s, { scale: 1.5 }, { scale: 1, duration: 0.4, ease: "back.out(3)" });
          }),
          0,
        );
      });

      // clock bar drains over 9 s, then the round starts again
      tl.add(gsap.fromTo(q("[data-clock]"), { scaleX: 1 }, { scaleX: 0, duration: 9, ease: "none", repeat: -1, transformOrigin: "0% 50%" }), 0);

      const st = ScrollTrigger.create({
        trigger: root.current,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => (self.isActive ? tl.play() : tl.pause()),
      });
      return () => st.kill();
    },
    { scope: root },
  );

  return (
    <div ref={root} className="absolute inset-0 overflow-hidden rounded-[2rem] bg-[linear-gradient(180deg,#2b1d3d_0%,#3a2341_55%,#5a2e33_100%)]" aria-hidden>
      {/* moon + stars */}
      <div className="absolute top-[9%] right-[12%] size-[14%] rounded-full bg-[#f6e3b5] shadow-[0_0_60px_10px_#f6e3b555]" />
      {[[12, 14], [30, 8], [48, 18], [64, 10], [8, 30], [40, 34]].map(([l, t], i) => (
        <span key={i} className="absolute size-1 rounded-full bg-white/60" style={{ left: `${l}%`, top: `${t}%` }} />
      ))}
      {/* ground */}
      <div className="absolute inset-x-0 bottom-0 h-[16%] bg-[#1a1216]" />
      <div className="absolute inset-x-0 bottom-[16%] h-1 bg-[#7ee081]/70" />
      {/* platforms */}
      {PLATS.map((p, i) => (
        <div key={i} className="absolute h-[3.5%] rounded-full bg-[#221a17] ring-2 ring-[#5fd69a]/70" style={{ left: `${p.l}%`, top: `${p.t}%`, width: `${p.w}%` }} />
      ))}
      {/* coins */}
      {COINS.map((c, i) => (
        <div key={i} data-coin className="absolute grid size-[6%] place-items-center rounded-full bg-[#ffd23f] ring-2 ring-[#c98a12]" style={{ left: `${c.l}%`, top: `${c.t}%` }}>
          <span className="h-1/2 w-[18%] rounded-full bg-[#c98a12]" />
        </div>
      ))}
      {/* players stand on platforms */}
      {PLAYERS.map((p, i) => (
        <div
          key={i}
          data-player
          className="absolute aspect-square w-[7.5%] rounded-[30%] shadow-lg"
          style={{ left: `${p.x}%`, top: `calc(${PLATS[p.plat].t}% - 7.5% * 1.6)`, background: p.color }}
        >
          <span className="absolute top-[30%] left-[22%] size-[18%] rounded-full bg-[#120d0b]" />
          <span className="absolute top-[30%] right-[22%] size-[18%] rounded-full bg-[#120d0b]" />
        </div>
      ))}
      {/* HUD: scores + clock */}
      <div className="absolute inset-x-4 top-4 flex items-center gap-2">
        {PLAYERS.map((p, i) => (
          <span key={i} className="flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1 font-mono text-xs text-white backdrop-blur">
            <span className="size-2 rounded-full" style={{ background: p.color }} />
            <span data-score className="inline-block min-w-[1.2em] text-right">0</span>
          </span>
        ))}
      </div>
      <div className="absolute inset-x-4 top-[15%] h-1 overflow-hidden rounded-full bg-white/10">
        <div data-clock className="h-full w-full bg-amber" />
      </div>
    </div>
  );
}
