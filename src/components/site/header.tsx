"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Download, Menu, X } from "lucide-react";
import { gsap, registerGsap, ScrollTrigger, useGSAP } from "@/lib/motion";
import { nav } from "@/lib/site";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";

registerGsap();

// The menu sheet (Radix dialog) is only downloaded when someone opens it.
const MobileMenu = dynamic(() => import("./mobile-menu"), { ssr: false });

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const bar = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!bar.current) return;
    // Condense into a floating pill once the page scrolls.
    const st = ScrollTrigger.create({
      start: 40,
      end: "max",
      onToggle: (self) => {
        gsap.to(bar.current, {
          maxWidth: self.isActive ? 880 : 1216,
          marginTop: self.isActive ? 10 : 0,
          backgroundColor: self.isActive ? "rgba(23,17,15,0.78)" : "rgba(23,17,15,0)",
          borderColor: self.isActive ? "rgba(246,236,227,0.10)" : "rgba(246,236,227,0)",
          duration: 0.5,
          ease: "expo.out",
        });
      },
    });
    return () => st.kill();
  });

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3">
      <div
        ref={bar}
        className="mx-auto flex h-16 max-w-[1216px] items-center justify-between gap-4 rounded-full border border-transparent px-4 backdrop-blur-md sm:px-5"
      >
        <Link href="/" aria-label="HotTake home" className="shrink-0">
          <Logo />
        </Link>
        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {nav.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative rounded-full px-3.5 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground",
                      active && "text-foreground",
                    )}
                  >
                    {item.label}
                    {active && <span className="absolute inset-x-3.5 -bottom-0.5 h-px bg-gradient-to-r from-amber to-ember" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="flex items-center gap-2">
          <a
            href="/api/download"
            data-track="download_click"
            data-track-label="header"
            data-no-transition
            className="hidden h-10 items-center gap-2 rounded-full bg-ember px-4 text-sm font-semibold text-[#1a120d] transition-[transform,background] hover:bg-amber active:scale-[0.97] sm:inline-flex"
          >
            <Download className="size-4" aria-hidden /> Get HotTake
          </a>
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
            className="grid size-10 place-items-center rounded-full border border-border bg-bg-1/60 md:hidden"
          >
            {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
          </button>
        </div>
      </div>
      {open && <MobileMenu open={open} onOpenChange={setOpen} />}
    </header>
  );
}
