import type { Metadata } from "next";

export const metadata: Metadata = { title: "You're offline", robots: { index: false, follow: false } };

export default function OfflinePage() {
  return (
    <section className="grid min-h-[80vh] place-items-center px-4 pt-24 text-center">
      <div className="max-w-md">
        <p className="eyebrow">No connection</p>
        <h1 className="mt-3 text-5xl font-extrabold">You&apos;re offline.</h1>
        <p className="mt-4 text-muted-foreground">
          Pages you&apos;ve already opened still work. Good news: HotTake itself doesn&apos;t need the internet. Phones talk to your
          laptop over your own Wi-Fi.
        </p>
        {/* A full page load on purpose: it retries the network instead of a client-side transition. */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/" className="mt-8 inline-flex h-12 items-center rounded-full bg-ember px-6 font-semibold text-[#1a120d] hover:bg-amber">
          Try again
        </a>
      </div>
    </section>
  );
}
