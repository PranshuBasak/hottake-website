"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import type { EventName, TrackPayload } from "@/lib/track";
import { useConsent } from "./consent";

let consentRef: "all" | "essential" | null = null;

function clientInfo(): TrackPayload["client"] {
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { effectiveType?: string } };
  return {
    languages: [...(navigator.languages ?? [navigator.language])].slice(0, 10),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    screen: `${screen.width}x${screen.height}`,
    viewport: `${innerWidth}x${innerHeight}`,
    pixelRatio: Math.round(devicePixelRatio * 100) / 100,
    colorScheme: matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark",
    reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
    cpuCores: navigator.hardwareConcurrency,
    deviceMemory: nav.deviceMemory,
    connection: nav.connection?.effectiveType,
    touch: navigator.maxTouchPoints > 0,
  };
}

function utm(): TrackPayload["utm"] {
  const q = new URLSearchParams(location.search);
  const pick = (k: string) => q.get(`utm_${k}`)?.slice(0, 100) || undefined;
  const u = { source: pick("source"), medium: pick("medium"), campaign: pick("campaign"), term: pick("term"), content: pick("content") };
  return Object.values(u).some(Boolean) ? u : undefined;
}

/** Sends one event. Device details are attached only after "Accept all". */
export function track(name: EventName, props?: Record<string, string | number | boolean | null>, beacon = false) {
  if (typeof window === "undefined") return;
  const full = consentRef === "all";
  const body: TrackPayload = {
    name,
    path: location.pathname,
    props,
    ...(full ? { referrer: document.referrer || undefined, utm: utm(), client: clientInfo() } : {}),
  };
  const json = JSON.stringify(body);
  if (beacon && navigator.sendBeacon) {
    navigator.sendBeacon("/api/track", new Blob([json], { type: "application/json" }));
    return;
  }
  fetch("/api/track", { method: "POST", body: json, headers: { "content-type": "application/json" }, keepalive: true }).catch(() => {});
}

/** Page views, time on page, scroll depth, outbound links and `data-track` clicks. */
export function Tracker() {
  const pathname = usePathname();
  const { consent, ready } = useConsent();
  const started = useRef(0);
  const maxScroll = useRef(0);

  useEffect(() => {
    consentRef = consent;
  }, [consent]);

  useEffect(() => {
    if (!ready) return;
    consentRef = consent;
    started.current = performance.now();
    maxScroll.current = 0;
    track("page_view");
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - innerHeight;
      if (h > 0) maxScroll.current = Math.max(maxScroll.current, Math.round((scrollY / h) * 100));
    };
    const leave = () => {
      if (consentRef !== "all") return;
      track("page_leave", { seconds: Math.round((performance.now() - started.current) / 1000), scroll: maxScroll.current }, true);
    };
    const onHide = () => document.visibilityState === "hidden" && leave();
    addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onHide);
    return () => {
      leave();
      removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onHide);
    };
    // A fresh page view per route, and once the consent choice is known.
  }, [pathname, ready, consent]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-track], a[href^='http']");
      if (!el) return;
      const name = el.dataset.track as EventName | undefined;
      if (name) {
        track(name, { label: el.dataset.trackLabel ?? el.textContent?.trim().slice(0, 80) ?? null });
      } else if (el instanceof HTMLAnchorElement && el.host !== location.host) {
        track("outbound_link", { href: el.href.slice(0, 200) });
      }
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return null;
}
