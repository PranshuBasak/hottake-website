import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, Download, Globe, ShieldCheck, Trophy, Wifi } from "lucide-react";
import { ControlsTabs } from "@/components/guide/controls-tabs";
import { GuideNav } from "@/components/guide/guide-nav";
import { Reveal, SplitHeading } from "@/components/site/reveal";
import { ShaderBg } from "@/components/site/shader-bg";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { JsonLd, breadcrumbLd, faqLd } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "How to play — set up a HotTake party in 2 minutes",
  description:
    "Install HotTake on a Windows laptop, have friends scan the QR code, and play. Setup steps, phone/gamepad/keyboard controls, tournaments, online play and troubleshooting.",
  alternates: { canonical: "/how-to-play" },
  openGraph: { url: "/how-to-play", images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "HotTake" }], title: "How to play HotTake" },
};

const sections = [
  { id: "before", label: "Before you start" },
  { id: "setup", label: "Set up the party" },
  { id: "controls", label: "Controls" },
  { id: "during", label: "During a game" },
  { id: "tournament", label: "Tournament mode" },
  { id: "online", label: "Online play" },
  { id: "troubleshooting", label: "Troubleshooting" },
  { id: "make-a-game", label: "Make your own game" },
  { id: "faq", label: "FAQ" },
];

const setup = [
  { t: "Install and open HotTake", d: `Run ${site.installerName}. HotTake opens fullscreen on the lobby. Plug the laptop into a TV for the full effect.` },
  { t: "Allow network access", d: "The first time, Windows asks whether HotTake may use the network. Click Allow — otherwise phones can't reach the laptop." },
  { t: "Everyone joins the same Wi-Fi", d: "Phones scan the QR code on screen, or open the address shown and type the four-letter room code." },
  { t: "The first phone in is the leader", d: "The leader picks a game with their phone (it works as a remote) or the laptop's arrow keys, then presses Play." },
  { t: "Play", d: "Each phone turns into that game's controller. When the round ends, everyone lands back in the lobby with the results." },
];

const faq = [
  { q: "Do my friends need to install anything?", a: "No. The controller is a web page served by your laptop. Any modern phone browser works: scan the QR code and you're in." },
  { q: "Is HotTake free?", a: "Yes. HotTake and all 32 built-in games are free to download and play." },
  { q: "Does it need the internet?", a: "Not for local play. Everything runs on your laptop and phones talk to it over your Wi-Fi. Internet is only used for optional online play." },
  { q: "How many people can play?", a: "Up to 8 players at once, depending on the game. Some games work solo, and three are co-op." },
  { q: "Does it work on Mac or Linux?", a: "Not yet. The host app is Windows 10/11 only. Phones can be iPhone or Android." },
  { q: "Why does Windows say it protected my PC?", a: "The installer isn't code-signed yet, so SmartScreen shows a warning. Click More info, then Run anyway. Only download HotTake from this website." },
  { q: "Can I use a gamepad or keyboard?", a: "Yes. Plug in a USB or Bluetooth gamepad and press Start to join, or add keyboard players under Options › Players." },
];

export default function HowToPlayPage() {
  return (
    <>
      <JsonLd data={[faqLd(faq), breadcrumbLd([{ name: "Home", path: "/" }, { name: "How to play", path: "/how-to-play" }])]} />
      <section className="grain relative isolate overflow-hidden pt-36 pb-16">
        <ShaderBg variant="ember" />
        <div className="container-site relative">
          <p className="eyebrow mb-4">The host&apos;s guide</p>
          <SplitHeading as="h1" onScroll={false} className="max-w-4xl text-5xl font-extrabold sm:text-7xl">
            From download to first round in two minutes.
          </SplitHeading>
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
            Everything you need to run game night: setup, controls, tournaments, playing with friends far away, and what to do when a phone won&apos;t connect.
          </p>
        </div>
      </section>

      <div className="container-site pb-16">
        <div className="mx-auto max-w-3xl">
          <div className="sticky top-[76px] z-30 mb-12 rounded-[12px] bg-bg-0/80 backdrop-blur">
            <GuideNav sections={sections} />
          </div>
        <div className="space-y-24 [&_section]:scroll-mt-36">
          <section id="before" aria-labelledby="before-h">
            <h2 id="before-h" className="text-3xl font-bold">Before you start</h2>
            <Reveal className="mt-6 grid gap-4 sm:grid-cols-3">
              {[
                { icon: Download, t: "A Windows laptop", d: "Windows 10 or 11 with WebView2 (built into Windows 11)." },
                { icon: Wifi, t: "One Wi-Fi network", d: "The laptop and every phone on the same network." },
                { icon: ShieldCheck, t: "A phone each", d: "iPhone or Android with a recent browser. No app." },
              ].map((c) => (
                <div key={c.t} className="rounded-2xl border border-border bg-bg-1 p-5">
                  <c.icon className="size-5 text-amber" aria-hidden />
                  <h3 className="mt-3 font-bold">{c.t}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{c.d}</p>
                </div>
              ))}
            </Reveal>
          </section>

          <section id="setup" aria-labelledby="setup-h">
            <h2 id="setup-h" className="text-3xl font-bold">Set up the party</h2>
            <Reveal as="ol" className="mt-8 space-y-6">
              {setup.map((s, i) => (
                <li key={s.t} className="relative flex gap-5 rounded-2xl border border-border bg-bg-1 p-5">
                  <span className="font-heading text-4xl font-extrabold text-ember/70">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="text-lg font-bold">{s.t}</h3>
                    <p className="mt-1 text-muted-foreground">{s.d}</p>
                  </div>
                </li>
              ))}
            </Reveal>
          </section>

          <section id="controls" aria-labelledby="controls-h">
            <h2 id="controls-h" className="text-3xl font-bold">Controls</h2>
            <p className="mt-3 text-muted-foreground">Phones, gamepads and keyboards can all play in the same round.</p>
            <figure className="mt-6 overflow-hidden rounded-3xl border border-border bg-[#0b0b0b]">
              <iframe
                src="/figures/relay.html?theme=dark"
                title="Interactive drawing: press a pad on the phone and the player on the laptop moves, jumps or dashes"
                loading="lazy"
                className="block aspect-[10/12] w-full sm:aspect-[11/10]"
              />
              <figcaption className="border-t border-border px-5 py-3 text-sm text-muted-foreground">
                Hover the phone&apos;s stick or buttons: each press travels to the laptop and the player answers. Drawn with <a href="https://hairline.lucasmarkes.com" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-foreground">Hairline</a> (MIT).
              </figcaption>
            </figure>
            <div className="mt-6 rounded-3xl border border-border bg-bg-1 p-5 sm:p-6">
              <ControlsTabs />
            </div>
          </section>

          <section id="during" aria-labelledby="during-h">
            <h2 id="during-h" className="text-3xl font-bold">During a game</h2>
            <ul className="mt-6 space-y-3 text-muted-foreground">
              <li><strong className="text-foreground">Pause:</strong> press Esc on the laptop or hold ⏸ on a phone. The card offers Resume, Restart, Quit to lobby and Options. Only the leader or the laptop can restart or quit.</li>
              <li><strong className="text-foreground">Options (O):</strong> Sound, Display, Players and Network.</li>
              <li><strong className="text-foreground">Remove a player:</strong> hold × on their chip in the player strip for 800 ms. This also changes the QR and room code, so the removed phone can&apos;t rejoin.</li>
              <li><strong className="text-foreground">Dropped out?</strong> Reopen the page on your phone within 60 seconds and you get your seat back.</li>
              <li><strong className="text-foreground">Connection stats:</strong> F3 shows each player&apos;s path (WebRTC or WebSocket), ping and input age.</li>
            </ul>
          </section>

          <section id="tournament" aria-labelledby="tour-h">
            <h2 id="tour-h" className="flex items-center gap-3 text-3xl font-bold"><Trophy className="size-7 text-warn" aria-hidden /> Tournament mode</h2>
            <p className="mt-4 text-muted-foreground">
              With two or more players connected, press Tournament next to Play. Choose 3 to 12 games (6 by default); HotTake draws them at random with no repeats.
              Each round scores 3, 2 and 1 points for 1st, 2nd and 3rd, and the standings sort by average, so late joiners aren&apos;t punished.
              The final shows a podium and confetti in the winner&apos;s colour.
            </p>
          </section>

          <section id="online" aria-labelledby="online-h">
            <h2 id="online-h" className="flex items-center gap-3 text-3xl font-bold"><Globe className="size-7 text-[#3ec1ff]" aria-hidden /> Online play</h2>
            <p className="mt-4 text-muted-foreground">
              Friends somewhere else can join through <span className="font-mono text-foreground">hottake.pranshubasak.site</span> while they watch your screen on a video call.
              Turn on Online play in Options › Network and send them the invite link or the room code. Phones connect directly when they can and fall back to a relay when a mobile carrier blocks it.
            </p>
          </section>

          <section id="troubleshooting" aria-labelledby="trouble-h">
            <h2 id="trouble-h" className="flex items-center gap-3 text-3xl font-bold"><AlertTriangle className="size-7 text-warn" aria-hidden /> Troubleshooting</h2>
            <div className="mt-6 space-y-4">
              {[
                {
                  t: "Phones say the address is unreachable",
                  d: "Your router probably keeps Wi-Fi devices apart (AP or client isolation — common on guest, office and ISP Wi-Fi). Turn it off in the router, or switch on Windows Mobile Hotspot on the laptop and have phones join that. HotTake spots the hotspot within seconds; pick it under Options › Network. Online play also works around it.",
                },
                { t: "Nobody can connect at all", d: "Check that you clicked Allow on the Windows firewall prompt. If you missed it, allow HotTake under Windows Security › Firewall › Allow an app." },
                { t: "Windows protected your PC", d: "The installer isn't code-signed yet. Click More info, then Run anyway. Only download HotTake from this site." },
                { t: "Controls feel laggy", d: "Press F3: a player on WebSocket instead of WebRTC is on the slower fallback. Move closer to the router, or use the laptop hotspot." },
              ].map((x) => (
                <div key={x.t} className="rounded-2xl border border-border bg-bg-1 p-5">
                  <h3 className="font-bold">{x.t}</h3>
                  <p className="mt-1 text-muted-foreground">{x.d}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="make-a-game" aria-labelledby="make-h">
            <h2 id="make-h" className="text-3xl font-bold">Make your own game</h2>
            <p className="mt-4 text-muted-foreground">
              A HotTake game is a folder with a <code className="font-mono text-foreground">manifest.json</code> and an <code className="font-mono text-foreground">index.html</code>, run in a sandboxed frame.
              Any engine works. Turn on Developer mode under Options › Developer, download the starter template, load your folder, and share the result as a zip that others drop onto their HotTake window.
            </p>
          </section>

          <section id="faq" aria-labelledby="faq-h">
            <h2 id="faq-h" className="text-3xl font-bold">FAQ</h2>
            <Accordion type="single" collapsible className="mt-6">
              {faq.map((f) => (
                <AccordionItem key={f.q} value={f.q}>
                  <AccordionTrigger className="text-left text-base">{f.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            <p className="mt-8 text-muted-foreground">
              Still stuck? <Link href="/creator" className="text-amber underline underline-offset-4">Get in touch</Link>.
            </p>
          </section>
        </div>
        </div>
      </div>
    </>
  );
}
