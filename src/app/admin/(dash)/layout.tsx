import type { Metadata } from "next";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { AdminNav } from "@/components/admin/nav";
import { logout } from "../login/actions";

export const metadata: Metadata = { title: { default: "Admin", template: "%s · Admin · HotTake" }, robots: { index: false, follow: false } };

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="mx-auto grid min-h-dvh max-w-[1400px] gap-6 px-4 py-6 lg:grid-cols-[220px_1fr] lg:px-8">
      <aside className="flex flex-col gap-4 lg:sticky lg:top-6 lg:h-[calc(100dvh-3rem)]">
        <Link href="/" className="px-3 font-mono text-xs tracking-[0.2em] text-amber uppercase">
          HotTake admin
        </Link>
        <AdminNav />
        <p className="hidden px-3 text-xs text-muted-foreground lg:block">Read-only. Nothing here can be edited or deleted.</p>
        <form action={logout} className="lg:mt-auto">
          <button
            type="submit"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
          >
            <LogOut className="size-4" aria-hidden /> Sign out
          </button>
        </form>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
