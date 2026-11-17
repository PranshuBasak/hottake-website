"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Cookie } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CONSENT_COOKIE, consentCookie, effectiveConsent, parseConsent, type Consent } from "@/lib/consent";
import { gsap, registerGsap, shouldAnimate, useGSAP } from "@/lib/motion";

registerGsap();

// The preferences dialog (Radix) is only downloaded when someone opens it.
const PreferencesDialog = dynamic(() => import("./cookie-preferences"), { ssr: false });

type Ctx = {
  /** null until the visitor chooses (or the browser sends DNT/GPC). */
  consent: Consent | null;
  ready: boolean;
  choose: (c: Consent) => void;
  openPreferences: () => void;
};

const ConsentContext = createContext<Ctx | null>(null);

export function useConsent(): Ctx {
  const ctx = useContext(ConsentContext);
  if (!ctx) throw new Error("useConsent must be used inside <ConsentProvider>");
  return ctx;
}

function readCookie(name: string): string | undefined {
  return document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${name}=`))
    ?.split("=")[1];
}

// Tiny external store over the consent cookie: "pending" on the server, the real value in the browser.
type Snapshot = Consent | "none" | "pending";
const listeners = new Set<() => void>();
function subscribeConsent(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
function readConsent(): Snapshot {
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
  return (
    effectiveConsent(parseConsent(readCookie(CONSENT_COOKIE)), {
      dnt: nav.doNotTrack === "1",
      gpc: nav.globalPrivacyControl === true,
    }) ?? "none"
  );
}

export function ConsentProvider({ children }: { children: React.ReactNode }) {
  const snap = useSyncExternalStore<Snapshot>(subscribeConsent, readConsent, () => "pending");
  const ready = snap !== "pending";
  const path = usePathname();
  const isAdmin = path === "/admin" || !!path?.startsWith("/admin/");
  const consent: Consent | null = snap === "all" || snap === "essential" ? snap : null;
  const [prefsOpen, setPrefsOpen] = useState(false);

  const choose = useCallback((c: Consent) => {
    document.cookie = consentCookie(c, location.protocol === "https:");
    if (c === "essential") {
      // Withdraw: clear the readable analytics cookie now; the server clears the httpOnly ones on the next hit.
      document.cookie = "ht_last=; Max-Age=0; Path=/";
    }
    listeners.forEach((l) => l());
    setPrefsOpen(false);
  }, []);

  const value = useMemo(() => ({ consent, ready, choose, openPreferences: () => setPrefsOpen(true) }), [consent, ready, choose]);

  return (
    <ConsentContext.Provider value={value}>
      {children}
      {ready && consent === null && !isAdmin && <ConsentBanner onChoose={choose} onCustomize={() => setPrefsOpen(true)} />}
      {prefsOpen && <PreferencesDialog open={prefsOpen} onOpenChange={setPrefsOpen} current={consent} onSave={choose} />}
    </ConsentContext.Provider>
  );
}

function ConsentBanner({ onChoose, onCustomize }: { onChoose: (c: Consent) => void; onCustomize: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      if (!ref.current || !shouldAnimate()) return;
      gsap.from(ref.current, { y: 40, autoAlpha: 0, duration: 0.8, delay: 1.2, ease: "expo.out" });
    },
    { scope: ref },
  );

  return (
    <div
      ref={ref}
      role="region"
      aria-label="Cookie choices"
      className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-xl rounded-2xl border border-border bg-[#1a1311]/95 p-4 shadow-2xl backdrop-blur-xl sm:inset-x-auto sm:right-5 sm:bottom-5 sm:p-5"
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-ember/15 text-ember">
          <Cookie className="size-4" aria-hidden />
        </span>
        <div className="space-y-3">
          <p className="text-sm leading-relaxed text-muted-foreground">
            We use one essential cookie to remember this choice. With your OK we also record visit analytics (your IP, rough
            location, device, browser and the pages you open) to see how people find HotTake.{" "}
            <Link href="/cookies" className="text-foreground underline underline-offset-4 hover:text-amber">
              Cookie details
            </Link>
          </p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => onChoose("all")}>
              Accept all
            </Button>
            <Button size="sm" variant="secondary" onClick={() => onChoose("essential")}>
              Essential only
            </Button>
            <Button size="sm" variant="ghost" onClick={onCustomize}>
              Customize
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
