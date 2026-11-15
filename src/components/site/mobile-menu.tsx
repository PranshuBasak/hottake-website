"use client";

import Link from "next/link";
import { Download } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { nav } from "@/lib/site";
import { Logo } from "./logo";

export default function MobileMenu({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[82vw] max-w-sm border-border bg-bg-1">
        <SheetHeader>
          <SheetTitle>
            <Logo />
          </SheetTitle>
        </SheetHeader>
        <nav aria-label="Mobile" className="px-4">
          <ul className="space-y-1">
            {[{ href: "/", label: "Home" }, ...nav].map((item) => (
              <li key={item.href}>
                <Link href={item.href} onClick={() => onOpenChange(false)} className="block rounded-xl px-3 py-3 font-heading text-2xl font-bold hover:bg-bg-3">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <a
            href="/api/download"
            data-track="download_click"
            data-track-label="mobile-menu"
            data-no-transition
            className="mt-6 flex h-12 items-center justify-center gap-2 rounded-full bg-ember font-semibold text-[#1a120d]"
          >
            <Download className="size-4" aria-hidden /> Download for Windows
          </a>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
