"use client";

import { useRef } from "react";
import { Gamepad2, Laptop, QrCode } from "lucide-react";
import { AsciiArt } from "@/components/site/ascii-art";
import { gsap, registerGsap, shouldAnimate, useGSAP } from "@/lib/motion";
import { PhonePad } from "./phone-pad";
import { gameCount } from "@/lib/site";

registerGsap();

const steps = [
  {
    icon: Laptop,
    kicker: "01 · Start",
    title: "Open HotTake on the laptop",
    body: "It goes fullscreen on the lobby and shows a QR code and a four-letter room code. Plug it into the TV if you have one.",
  },
  {
    icon: QrCode,
    kicker: "02 · Join",
    title: "Everyone scans the code",
    body: "Phones on the same Wi-Fi open the controller in their browser. No app store, no sign-up. The first phone in is the leader.",
  },
  {
    icon: Gamepad2,
    kicker: "03 · Play",
    title: "Pick a game and go",
    body: `The leader picks from ${gameCount} games, or starts a tournament. Phones become d-pads, joysticks and buttons, and change for every game.`,
  },
];

export function HowItWorks() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!shouldAnimate()) return;
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px)", () => {
        const q = gsap.utils.selector(root);
        const panels = q<HTMLElement>("[data-step-visual]");
        const texts = q<HTMLElement>("[data-step-text]");
        gsap.set(panels.slice(1), { autoAlpha: 0, yPercent: 12, scale: 0.94 });
        gsap.set(texts.slice(1), { autoAlpha: 0.72 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: q("[data-pin]")[0],
            start: "top top",
            end: `+=${steps.length * 90}%`,
            pin: true,
            scrub: 0.6,
            snap: { snapTo: 1 / (steps.length - 1), duration: 0.5, ease: "power2.inOut" },
          },
        });
        steps.slice(1).forEach((_, i) => {
          tl.to(panels[i], { autoAlpha: 0, yPercent: -12, scale: 0.94 }, i)
            .to(panels[i + 1], { autoAlpha: 1, yPercent: 0, scale: 1 }, i)
            .to(texts[i], { autoAlpha: 0.72 }, i)
            .to(texts[i + 1], { autoAlpha: 1 }, i);
        });
        tl.to(q("[data-progress]"), { scaleY: 1, ease: "none", duration: steps.length - 1 }, 0);
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} id="how-it-works" aria-labelledby="how-title" className="relative">
      <div data-pin className="relative flex min-h-[100svh] items-center py-24">
        <div className="container-site grid items-center gap-14 lg:grid-cols-2">
          <div>
            <p className="eyebrow mb-4">How it works</p>
            <h2 id="how-title" className="text-4xl font-extrabold sm:text-6xl">
              Three steps from sofa to scoreboard.
            </h2>
            <div className="relative mt-10 pl-8">
              <span className="absolute top-2 bottom-2 left-[11px] w-px bg-border" />
              <span data-progress className="absolute top-2 bottom-2 left-[11px] w-px origin-top scale-y-0 bg-gradient-to-b from-amber to-ember" />
              <ol className="space-y-10">
                {steps.map((s) => (
                  <li key={s.title} data-step-text className="relative">
                    <span className="absolute top-1 -left-8 grid size-6 place-items-center rounded-full border border-amber/40 bg-bg-0">
                      <s.icon className="size-3.5 text-amber" aria-hidden />
                    </span>
                    <p className="eyebrow mb-1 text-muted-foreground">{s.kicker}</p>
                    <h3 className="text-2xl font-bold">{s.title}</h3>
                    <p className="mt-2 max-w-md text-muted-foreground">{s.body}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div className="relative hidden aspect-square w-full max-w-[560px] justify-self-center lg:block" aria-hidden>
            <div className="absolute inset-0 rounded-[2rem] border border-border bg-bg-1/60" />
            {/* step 1: laptop lobby with QR */}
            <div data-step-visual className="absolute inset-0 grid place-items-center p-10">
              <div className="w-full rounded-2xl border border-white/10 bg-[#0b0807] p-2 shadow-2xl">
                <div className="grid aspect-[16/10] place-items-center rounded-lg bg-bg-2">
                  <div className="flex items-center gap-6">
                    <QrMock />
                    <div>
                      <p className="eyebrow">Room code</p>
                      <p className="font-mono text-5xl font-bold tracking-[0.2em]">FIRE</p>
                      <p className="mt-2 text-sm text-muted-foreground">Scan to join · 0/8</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* step 2: phones joining */}
            <div data-step-visual className="absolute inset-0 grid place-items-center">
              <div className="flex items-end gap-5">
                {["#ff5d73", "#3ec1ff", "#ffd23f"].map((c, i) => (
                  <div key={c} className="w-28" style={{ transform: `translateY(${[0, -24, 8][i]}px) rotate(${[-6, 2, 7][i]}deg)` }}>
                    <PhonePad color={c} variant={(["dpad", "stick", "buttons"] as const)[i]} />
                  </div>
                ))}
              </div>
              <span className="absolute bottom-10 rounded-full bg-ok/15 px-4 py-1.5 text-sm text-ok">3 players joined · Ana is the leader</span>
            </div>
            {/* step 3: play */}
            <div data-step-visual className="absolute inset-0 overflow-hidden rounded-[2rem]">
              <AsciiArt cover piece="fireworks" size={11} className="absolute inset-0 overflow-hidden h-full w-full" />
              <div className="absolute inset-x-8 bottom-8 rounded-2xl border border-border bg-bg-0/80 p-4 backdrop-blur">
                <p className="eyebrow">Round 2 of 6</p>
                <p className="font-heading text-2xl font-bold">Coin Clash · 90 s</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function QrMock() {
  // Deterministic pseudo-QR pattern (decorative), drawn as one SVG path instead of 441 DOM nodes.
  let d = "";
  for (let y = 0; y < 21; y++)
    for (let x = 0; x < 21; x++) {
      const finder = (cx: number, cy: number) => x >= cx && x < cx + 7 && y >= cy && y < cy + 7;
      let on: boolean;
      if (finder(0, 0) || finder(14, 0) || finder(0, 14)) {
        const lx = x >= 14 ? x - 14 : x, ly = y >= 14 ? y - 14 : y;
        on = Math.max(Math.abs(lx - 3), Math.abs(ly - 3)) !== 2;
      } else on = (x * 7 + y * 13 + x * y) % 5 < 2;
      if (on) d += `M${x} ${y}h1v1h-1z`;
    }
  return (
    <svg viewBox="-1 -1 23 23" className="size-40 rounded-lg bg-[#f6ece3]" aria-hidden>
      <path d={d} fill="#120d0b" />
    </svg>
  );
}
