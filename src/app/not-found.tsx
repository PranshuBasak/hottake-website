import Link from "next/link";
import { AsciiArt } from "@/components/site/ascii-art";

export default function NotFound() {
  return (
    <section className="relative grid min-h-[85vh] place-items-center overflow-hidden px-4 pt-24 text-center">
      <div aria-hidden className="absolute inset-0 opacity-30">
        <AsciiArt piece="starfield-warp" size={11} className="block h-full w-full" />
      </div>
      <div className="relative">
        <p className="eyebrow">Error 404</p>
        <h1 className="mt-3 font-mono text-7xl font-bold tracking-[0.2em] sm:text-9xl">GAME OVER</h1>
        <p className="mx-auto mt-5 max-w-md text-lg text-muted-foreground">This page fell off the lily pad. Press continue to head back to the lobby.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/" className="inline-flex h-12 items-center rounded-full bg-ember px-6 font-semibold text-[#1a120d] hover:bg-amber">
            Continue
          </Link>
          <Link href="/games" className="inline-flex h-12 items-center rounded-full border border-border px-6 font-semibold hover:border-white/30">
            Browse games
          </Link>
        </div>
      </div>
    </section>
  );
}
