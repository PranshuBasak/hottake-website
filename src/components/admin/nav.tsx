"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Download, Gamepad2, Globe2, Mail, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", label: "Overview", icon: BarChart3 },
  { href: "/admin/audience", label: "Audience", icon: Globe2 },
  { href: "/admin/downloads", label: "Downloads", icon: Download },
  { href: "/admin/signups", label: "Sign-ups", icon: Mail },
  { href: "/admin/games", label: "Games", icon: Gamepad2 },
  { href: "/admin/comments", label: "Comments", icon: MessageSquare },
] as const;

export function AdminNav() {
  const path = usePathname();
  return (
    <nav aria-label="Admin" className="flex gap-1 overflow-x-auto lg:flex-col">
      {LINKS.map(({ href, label, icon: Icon }) => {
        const active = path === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground",
              active && "bg-ember/15 text-foreground",
            )}
          >
            <Icon className={cn("size-4", active && "text-amber")} aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
