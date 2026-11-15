"use client";

import { useConsent } from "@/components/site/consent";
import { Button } from "@/components/ui/button";

/** Opens the cookie preferences dialog so a visitor can change or withdraw consent. */
export function CookiePrefsButton({ label = "Change cookie settings" }: { label?: string }) {
  const { openPreferences } = useConsent();
  return (
    <Button type="button" variant="outline" size="lg" className="mt-4" onClick={openPreferences}>
      {label}
    </Button>
  );
}
