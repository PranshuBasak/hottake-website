"use client";

import { useEffect } from "react";
import { playSound } from "@/lib/sound";

const CLICKABLE = 'a[href], button, [role="button"], [role="radio"], [role="tab"], [role="switch"], summary, label[for]';
const HOVERABLE = 'button, [role="button"], header a[href]';

/**
 * Site-wide interface sounds: a soft tick on clicks and a quieter one when a mouse moves onto a button.
 * Parts that play their own sounds sit inside `[data-sound="custom"]`. The admin area stays quiet.
 */
export function SoundEffects() {
  useEffect(() => {
    const skip = (el: Element) => location.pathname.startsWith("/admin") || !!el.closest('[data-sound="custom"], [aria-disabled="true"], :disabled');

    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest(CLICKABLE);
      if (el && !skip(el)) playSound("click");
    };
    let last: Element | null = null;
    const onOver = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const el = (e.target as Element | null)?.closest(HOVERABLE) ?? null;
      if (el === last) return;
      last = el;
      if (el && !skip(el)) playSound("hover");
    };
    document.addEventListener("click", onClick, { capture: true, passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    return () => {
      document.removeEventListener("click", onClick, { capture: true });
      document.removeEventListener("pointerover", onOver);
    };
  }, []);
  return null;
}
