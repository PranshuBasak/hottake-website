import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AlertTriangle, Check, Cpu, Download, HardDrive, Monitor, Wifi } from "lucide-react";
import { CopyButton } from "@/components/interior/copy-button";
import { AsciiArt } from "@/components/site/ascii-art";
import { Reveal, SplitHeading } from "@/components/site/reveal";
import { ShaderBg } from "@/components/site/shader-bg";
import { formatBytes } from "@/lib/download";
import { fallbackRelease, getLatestRelease } from "@/lib/releases";
import { JsonLd, breadcrumbLd, softwareLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Download HotTake for Windows (free)",
  description: "Download the free HotTake installer for Windows 10 and 11. Version, file size, SHA-256 checksum and what to expect on first launch.",
  alternates: { canonical: "/download" },
  openGraph: { url: "/download", title: "Download HotTake for Windows" },
};

export default async function DownloadPage({ searchParams }: PageProps<"/download">) {
  const release = await getLatestRelease();
  const version = release?.version ?? fallbackRelease.version;
  const fileName = release?.file_name ?? fallbackRelease.file_name;
  const size = release ? formatBytes(release.size_bytes) : fallbackRelease.size_label;

  return (
    <>
      <JsonLd data={[softwareLd(), breadcrumbLd([{ name: "Home", path: "/" }, { name: "Download", path: "/download" }])]} />
      <section className="grain relative isolate overflow-hidden pt-36 pb-20">
        <ShaderBg variant="hero" />
        <div className="container-site relative grid items-center gap-12 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="eyebrow mb-4">Free · Windows 10 &amp; 11</p>
            <SplitHeading as="h1" onScroll={false} className="text-5xl font-extrabold sm:text-7xl">
              Download HotTake.
            </SplitHeading>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              One installer, 32 games inside. Phones need nothing — they join through the browser.
            </p>
            <Suspense fallback={null}>
              <UnavailableNotice searchParams={searchParams} />
            </Suspense>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="/api/download"
                data-track="download_click"
                data-track-label="download-page"
                data-no-transition
                className="inline-flex h-16 items-center gap-3 rounded-full bg-ember px-8 text-lg font-bold text-[#1a120d] shadow-[0_10px_40px_-10px_#ff6b4f] transition-[transform,background] hover:-translate-y-0.5 hover:bg-amber active:scale-[0.98]"
              >
                <Download className="size-5" aria-hidden /> Download for Windows
              </a>
              <div className="text-sm text-muted-foreground">
                <p className="font-mono text-foreground">{fileName}</p>
                <p>
                  v{version} · {size} · 64-bit
                </p>
              </div>
            </div>
          </div>
          <div className="relative hidden aspect-square overflow-hidden rounded-[2rem] border border-border bg-bg-0/50 lg:block" aria-hidden>
            <AsciiArt piece="synthwave-grid" size={11} className="absolute inset-0 block h-full w-full" />
          </div>
        </div>
      </section>

      <section className="container-site grid gap-10 py-16 lg:grid-cols-2">
        <Reveal>
          <h2 className="text-3xl font-bold">First launch, step by step</h2>
          <ol className="mt-6 space-y-5">
            {[
              ["Run the installer", "Double-click the file you downloaded."],
              [
                "If Windows says “Windows protected your PC”",
                "Click More info, then Run anyway. HotTake isn't code-signed yet, so SmartScreen doesn't know it. The checksum below lets you confirm the file is the real one.",
              ],
              ["Allow network access", "When the firewall asks, click Allow so phones can reach the laptop."],
              ["Scan and play", "Phones on the same Wi-Fi scan the QR code. That's it."],
            ].map(([t, d], i) => (
              <li key={t} className="flex gap-4">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-ember/15 font-mono text-sm text-ember">{i + 1}</span>
                <div>
                  <h3 className="font-bold">{t}</h3>
                  <p className="mt-1 text-muted-foreground">{d}</p>
                </div>
              </li>
            ))}
          </ol>
          <Link href="/how-to-play" className="mt-8 inline-block text-amber underline underline-offset-4">
            Full host guide →
          </Link>
        </Reveal>

        <Reveal className="space-y-5">
          <div className="rounded-3xl border border-border bg-bg-1 p-6">
            <h2 className="text-lg font-bold">System requirements</h2>
            <ul className="mt-4 space-y-3 text-sm">
              {[
                { icon: Monitor, t: "Windows 10 or 11, 64-bit, with WebView2 (built into Windows 11)" },
                { icon: Cpu, t: "Any laptop from the last few years; WebGL for the 3D games" },
                { icon: HardDrive, t: "About 100 MB of disk space" },
                { icon: Wifi, t: "A Wi-Fi network the phones can join (or the laptop's hotspot)" },
              ].map((r) => (
                <li key={r.t} className="flex gap-3 text-muted-foreground">
                  <r.icon className="mt-0.5 size-4 shrink-0 text-amber" aria-hidden /> {r.t}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl border border-border bg-bg-1 p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <Check className="size-4 text-ok" aria-hidden /> Verify the download
            </h2>
            {release ? (
              <>
                <p className="mt-2 text-sm text-muted-foreground">
                  In PowerShell: <code className="font-mono text-foreground">Get-FileHash .\{fileName}</code>. It should print this SHA-256:
                </p>
                <div className="mt-3 flex items-center gap-2 rounded-xl border border-border bg-bg-0 p-3">
                  <code className="min-w-0 flex-1 truncate font-mono text-xs">{release.sha256}</code>
                  <CopyButton value={release.sha256} label="Copy" />
                </div>
              </>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">The checksum appears here once the release is published.</p>
            )}
          </div>
        </Reveal>
      </section>
    </>
  );
}

async function UnavailableNotice({ searchParams }: { searchParams: PageProps<"/download">["searchParams"] }) {
  const { error } = await searchParams;
  if (error !== "unavailable") return null;
  return (
    <p role="alert" className="mt-6 flex items-start gap-2 rounded-2xl border border-warn/40 bg-warn/10 p-4 text-sm">
      <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warn" aria-hidden />
      The download server didn&apos;t answer just now. Please try again in a minute.
    </p>
  );
}
