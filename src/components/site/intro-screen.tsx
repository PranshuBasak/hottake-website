import { INTRO_KEY } from "@/lib/intro";
import { IntroOverlay } from "./intro-overlay";

/**
 * One-time intro on a visitor's very first load. The overlay is in the server HTML so it covers
 * the first paint; this tiny script hides it before paint for returning visitors, the admin area
 * and anyone who prefers reduced motion. Page-to-page navigation keeps using PageTransition.
 */
export function IntroScreen() {
  const script = `try{var d=document.documentElement;if(localStorage.getItem(${JSON.stringify(INTRO_KEY)})||location.pathname.indexOf("/admin")===0||matchMedia("(prefers-reduced-motion: reduce)").matches)d.classList.add("intro-seen");else d.classList.add("intro-on")}catch(e){document.documentElement.classList.add("intro-seen")}`;
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: script }} />
      <IntroOverlay />
    </>
  );
}
