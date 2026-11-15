"use client";

import { useRef } from "react";
import { Code2, Gamepad2, Globe, Smartphone, Trophy, Zap } from "lucide-react";
import { CopyButton } from "@/components/interior/copy-button";
import { SplitHeading } from "@/components/site/reveal";
import { gsap, registerGsap, shouldAnimate, useGSAP } from "@/lib/motion";
import { cn } from "@/lib/utils";

registerGsap();

const SDK = `import { Party } from "/sdk/screen-sdk.js";

const party = await Party.connect();
party.ready();
party.on("join", (p) => addPlayer(p));

function tick() {
  for (const p of players) {
    const i = party.input(p.id);
    if (i.pressed.Jump) jump(p);
  }
}`;

type Feature = { icon: typeof Zap; title: string; body: string; className?: string; accent: string };

const features: Feature[] = [
  {
    icon: Smartphone,
    title: "No app. No account.",
    body: "The controller is a web page the laptop serves to your phone. Scan, tap your name, play. Works on any modern phone browser.",
    className: "lg:col-span-2",
    accent: "#ff6b4f",
  },
  {
    icon: Zap,
    title: "Input that keeps up",
    body: "Button presses travel over a WebRTC data channel (UDP), so one lost packet never holds up the next. WebSocket fallback is automatic.",
    accent: "#ffd23f",
  },
  {
    icon: Gamepad2,
    title: "Pads and keyboards welcome",
    body: "Plug in USB or Bluetooth gamepads, or add keyboard players on the laptop. Mix them with phones in the same game.",
    accent: "#3ec1ff",
  },
  {
    icon: Trophy,
    title: "Tournament mode",
    body: "Play 3 to 12 random games in a row. Points per round, a live leaderboard, and a podium with confetti in the winner's colour.",
    accent: "#7ee081",
  },
  {
    icon: Globe,
    title: "Friends far away? Send a link.",
    body: "Point your own Cloudflare Tunnel hostname at the laptop, switch on online play, and remote friends join while they watch your screen on a call.",
    accent: "#b18cff",
  },
];

export function Features() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!shouldAnimate()) return;
      // Cards rise and un-tilt into place. clearProps hands the transform back to CSS once done.
      gsap.from("[data-feature]", {
        y: 60,
        autoAlpha: 0,
        rotationX: -12,
        transformOrigin: "50% 100%",
        stagger: 0.08,
        duration: 1.1,
        ease: "expo.out",
        clearProps: "transform,opacity,visibility",
        scrollTrigger: { trigger: root.current, start: "top 80%", once: true },
      });
    },
    { scope: root },
  );

  // Cursor spotlight on every card (CSS vars, no re-render).
  const onMove = (e: React.PointerEvent<HTMLElement>) => {
    const card = (e.target as HTMLElement).closest<HTMLElement>("[data-feature]");
    if (!card) return;
    const r = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${e.clientX - r.left}px`);
    card.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  return (
    <section ref={root} aria-labelledby="features-title" className="container-site py-28" onPointerMove={onMove}>
      <p className="eyebrow mb-4">Why it works at parties</p>
      <SplitHeading className="max-w-3xl text-4xl font-extrabold sm:text-6xl">
        <span id="features-title">Built so nobody waits for the next round.</span>
      </SplitHeading>
      <div className="mt-14 grid gap-4 [perspective:1200px] md:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <Card key={f.title} {...f} />
        ))}
        <article data-feature className="group relative overflow-hidden rounded-3xl border border-border bg-bg-1 p-7 md:col-span-2 lg:col-span-3 lg:grid lg:grid-cols-[1fr_1.2fr] lg:gap-10">
          <Spot accent="#ff7ad9" />
          <div className="relative">
            <span className="mb-5 grid size-11 place-items-center rounded-2xl bg-[#ff7ad9]/12 text-[#ff7ad9]">
              <Code2 className="size-5" aria-hidden />
            </span>
            <h3 className="text-2xl font-bold">Make your own game</h3>
            <p className="mt-3 max-w-md text-muted-foreground">
              A game is a folder with a manifest and an <code className="font-mono text-sm text-foreground">index.html</code>. Use canvas,
              Phaser, Three.js or WASM. A 3 kB SDK hands you every player&apos;s input; HotTake does the rooms, phones and
              results. Download the starter template from the developer menu, then share your game as a zip.
            </p>
          </div>
          <div className="relative mt-6 lg:mt-0">
            <div className="absolute top-3 right-3 z-10">
              <CopyButton value={SDK} label="Copy" />
            </div>
            <pre className="overflow-x-auto rounded-2xl border border-border bg-bg-0 p-5 pr-24 font-mono text-[13px] leading-relaxed text-muted-foreground">
              <code>{SDK}</code>
            </pre>
          </div>
        </article>
      </div>
    </section>
  );
}

function Spot({ accent }: { accent: string }) {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      style={{ background: `radial-gradient(420px circle at var(--mx, 50%) var(--my, 50%), ${accent}1f, transparent 60%)` }}
    />
  );
}

function Card({ icon: Icon, title, body, className, accent }: Feature) {
  return (
    <article
      data-feature
      className={cn(
        "group relative overflow-hidden rounded-3xl border border-border bg-bg-1 p-7 transition-[border-color] duration-500 hover:border-white/20",
        className,
      )}
    >
      <Spot accent={accent} />
      <span className="relative mb-5 grid size-11 place-items-center rounded-2xl" style={{ background: `${accent}1f`, color: accent }}>
        <Icon className="size-5 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6" aria-hidden />
      </span>
      <h3 className="relative text-2xl font-bold">{title}</h3>
      <p className="relative mt-3 text-muted-foreground">{body}</p>
    </article>
  );
}
