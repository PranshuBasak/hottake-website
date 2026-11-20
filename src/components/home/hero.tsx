"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";
import { ArrowRight, Download } from "lucide-react";
import { ShaderBg } from "@/components/site/shader-bg";
import { gsap, keepGradientWords, registerGsap, shouldAnimate, SplitText, useGSAP } from "@/lib/motion";
import type { Game } from "@/lib/games";
import { PhonePad } from "./phone-pad";
import { gameCount } from "@/lib/site";

registerGsap();

const SEATS = ["#ff5d73", "#3ec1ff", "#ffd23f", "#7ee081"];

export function Hero({ covers }: { covers: Pick<Game, "id" | "name" | "cover">[] }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!shouldAnimate()) return;
      const q = gsap.utils.selector(root);
      // No mask: the headline is the LCP element, so its words stay painted from the first frame and only slide and brighten.
      const split = SplitText.create(q("[data-hero-title]")[0], { type: "words" });
      keepGradientWords(split.words);
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
      tl.from(split.words, { y: "0.32em", rotate: 2, color: "#5a4a40", duration: 1.1, stagger: 0.05 }, 0)
        .from(q("[data-hero-eyebrow]"), { y: 20, autoAlpha: 0, duration: 0.8 }, 0)
        .from(q("[data-hero-copy]"), { y: 24, autoAlpha: 0, duration: 1 }, "-=0.9")
        .from(q("[data-hero-cta]"), { y: 20, autoAlpha: 0, duration: 0.9, clearProps: "transform" }, "-=0.8")
        .from(q("[data-hero-stat]"), { y: 16, autoAlpha: 0, stagger: 0.06, duration: 0.8 }, "-=0.7")
        .from(q("[data-laptop]"), { y: 80, rotateX: 18, autoAlpha: 0, duration: 1.6 }, 0.3)
        .from(q("[data-cover]"), { scale: 0.6, autoAlpha: 0, stagger: { each: 0.04, from: "random" }, duration: 0.9 }, 0.9)
        .from(q("[data-phone]"), { y: 160, rotate: (i) => [-18, 14, -10, 16][i] ?? 0, autoAlpha: 0, stagger: 0.12, duration: 1.4, ease: "back.out(1.4)" }, 1.0);

      // Idle float on the phones (desktop only: it's decoration, not worth a phone's battery).
      const desktop = matchMedia("(min-width: 1024px) and (pointer: fine)").matches;
      if (desktop) q("[data-phone]").forEach((el, i) => {
        gsap.to(el, { y: "+=10", duration: 2.4 + i * 0.3, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 2.4 + i * 0.2 });
      });

      // Pointer parallax on the device stage.
      const stage = q("[data-stage]")[0] as HTMLElement | undefined;
      if (stage && matchMedia("(pointer: fine)").matches) {
        // gsap.quickTo can't drive rotateX/rotateY (they share one transform), so retarget a tween per move.
        const onMove = (e: PointerEvent) => {
          gsap.to(stage, {
            rotationY: (e.clientX / innerWidth - 0.5) * 10,
            rotationX: (e.clientY / innerHeight - 0.5) * -8,
            duration: 0.8,
            ease: "power3.out",
            overwrite: "auto",
          });
        };
        addEventListener("pointermove", onMove);
        return () => {
          removeEventListener("pointermove", onMove);
          split.revert();
        };
      }
      return () => split.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} className="grain relative isolate min-h-[100svh] overflow-hidden pt-28 pb-16 sm:pt-36">
      <ShaderBg variant="hero" />
      <div className="container-site relative grid items-center gap-14 lg:grid-cols-[1.05fr_1fr]">
        <div>
          <p data-hero-eyebrow className="eyebrow mb-5 inline-flex items-center gap-2 rounded-full border border-amber/25 bg-bg-0/40 px-3 py-1.5 backdrop-blur">
            <span className="size-1.5 animate-pulse rounded-full bg-ok" /> Party-game console · Windows · Free
          </p>
          <h1
            data-hero-title
            className="text-[clamp(2.6rem,7vw,5.6rem)] leading-[0.95] font-extrabold tracking-[-0.035em]"
          >
            Your laptop is the console. <span className="text-gradient-ember">Every phone</span> is a controller.
          </h1>
          <p data-hero-copy className="mt-6 max-w-xl text-lg text-muted-foreground sm:text-xl">
            HotTake turns game night into a scan-and-play party. Friends point their camera at a QR code and they&apos;re in.
            No app, no account, no cloud server. {gameCount} games for up to 8 players, built in.
          </p>
          <div data-hero-cta className="mt-9 flex flex-wrap items-center gap-3">
            <a
              href="/api/download"
              data-track="download_click"
              data-track-label="hero"
              data-no-transition
              className="group inline-flex h-14 items-center gap-3 rounded-full bg-ember px-7 text-base font-bold text-[#1a120d] shadow-[0_10px_40px_-10px_#ff6b4f] transition-[transform,background,box-shadow] hover:-translate-y-0.5 hover:bg-amber hover:shadow-[0_16px_50px_-10px_#ffa94d] active:translate-y-0 active:scale-[0.98]"
            >
              <Download className="size-5" aria-hidden />
              Download for Windows
            </a>
            <Link
              href="/games"
              data-track="cta_click"
              data-track-label="hero-games"
              className="group inline-flex h-14 items-center gap-2 rounded-full border border-border bg-bg-0/40 px-6 font-semibold backdrop-blur transition-colors hover:border-amber/50 hover:bg-bg-2/60"
            >
              Browse the games <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
            </Link>
          </div>
          <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6">
            {[
              [String(gameCount), "games built in"],
              ["1–8", "players at once"],
              ["0", "apps to install"],
            ].map(([n, label]) => (
              <div key={label} data-hero-stat>
                <dt className="sr-only">{label}</dt>
                <dd className="font-heading text-4xl font-extrabold">{n}</dd>
                <dd className="mt-1 text-sm text-muted-foreground">{label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative [perspective:1400px] lg:mt-6 lg:self-start" aria-hidden>
          <div data-stage className="relative mx-auto aspect-[4/3] w-full max-w-[620px] [transform-style:preserve-3d]">
            <div data-laptop className="absolute inset-x-[4%] top-[6%] [transform-style:preserve-3d]">
              <div className="rounded-[18px] border border-white/10 bg-[#0b0807] p-2.5 shadow-[0_40px_120px_-20px_rgba(255,107,79,0.45)]">
                <div className="relative aspect-[16/10] overflow-hidden rounded-[10px] bg-bg-1">
                  <div className="absolute inset-0 bg-[radial-gradient(80%_80%_at_30%_10%,#ff6b4f33,transparent)]" />
                  <div className="relative flex h-full flex-col p-[4%]">
                    <div className="flex items-center justify-between">
                      <span className="font-heading text-[clamp(10px,1.6vw,16px)] font-extrabold">HotTake</span>
                      <span className="rounded-md bg-bg-3 px-2 py-0.5 font-mono text-[clamp(7px,1vw,11px)] tracking-widest text-amber">ROOM · FIRE</span>
                    </div>
                    <div className="mt-[4%] grid flex-1 grid-cols-4 gap-[3%]">
                      {covers.slice(0, 8).map((c) => (
                        <div key={c.id} data-cover className="relative overflow-hidden rounded-md bg-bg-3 ring-1 ring-white/5">
                          <Image src={c.cover} alt="" fill unoptimized loading="eager" className="object-cover" />
                        </div>
                      ))}
                    </div>
                    <div className="mt-[4%] flex gap-[2%]">
                      {SEATS.map((s, i) => (
                        <span key={s} className="flex items-center gap-1 rounded-full bg-bg-3 px-2 py-0.5 text-[clamp(6px,0.9vw,10px)]">
                          <span className="size-1.5 rounded-full" style={{ background: s }} /> P{i + 1}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mx-auto h-3 w-[108%] -translate-x-[3.7%] rounded-b-2xl bg-gradient-to-b from-[#2a211d] to-[#140f0d]" />
            </div>
            <div data-phone className="absolute -bottom-[6%] left-[-2%] w-[22%]"><PhonePad color={SEATS[0]} /></div>
            <div data-phone className="absolute right-[-3%] bottom-[2%] w-[21%]"><PhonePad color={SEATS[1]} variant="stick" /></div>
            <div data-phone className="absolute bottom-[-12%] left-[30%] hidden w-[19%] sm:block"><PhonePad color={SEATS[2]} variant="buttons" /></div>
            <div data-phone className="absolute right-[24%] bottom-[-14%] hidden w-[18%] sm:block"><PhonePad color={SEATS[3]} /></div>
          </div>
        </div>
      </div>
    </section>
  );
}
