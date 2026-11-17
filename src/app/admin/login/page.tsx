import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Admin sign in", robots: { index: false, follow: false } };

export default function AdminLoginPage() {
  return (
    <div className="grid min-h-dvh place-items-center px-4 py-16">
      <div className="w-full max-w-sm rounded-[2rem] border border-border bg-bg-1 p-8">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-amber">HotTake admin</p>
        <h1 className="mt-2 text-2xl font-bold">Sign in</h1>
        <p className="mt-1 mb-6 text-sm text-muted-foreground">Read-only view of site data. Nothing here can be edited or deleted.</p>
        <LoginForm />
      </div>
    </div>
  );
}
