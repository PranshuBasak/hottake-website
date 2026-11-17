"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** The admin area has its own chrome, so the public header, footer and tracker step aside there. */
export function HideOnAdmin({ children }: { children: ReactNode }) {
  const path = usePathname();
  return path === "/admin" || path?.startsWith("/admin/") ? null : children;
}
