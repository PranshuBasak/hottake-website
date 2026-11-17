"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, adminConfig, safeEqual, SESSION_MS, signSession, verifyPassword } from "@/lib/admin-auth";
import { getAdmin } from "@/lib/supabase/admin";
import { clientIp } from "@/lib/track";

export type LoginState = { error: string | null };

const GENERIC = "That username and password don't match.";

export async function login(_prev: LoginState, form: FormData): Promise<LoginState> {
  const cfg = adminConfig();
  if (!cfg) return { error: "The admin area isn't set up yet. Add the ADMIN_* environment variables." };

  const h = await headers();
  const ip = clientIp(h.get("x-forwarded-for"), h.get("x-real-ip")) ?? "0.0.0.0";
  const db = getAdmin();

  if (db) {
    const { data: locked } = await db.rpc("admin_is_locked", { p_ip: ip });
    if (locked) return { error: "Too many attempts. Try again in 15 minutes." };
  }

  const username = String(form.get("username") ?? "");
  const password = String(form.get("password") ?? "");
  // Always run the hash so a wrong username takes as long as a wrong password.
  const pwOk = verifyPassword(password, cfg.passwordHash);
  const ok = safeEqual(username.trim(), cfg.username) && pwOk;

  if (db) await db.rpc("admin_login_attempt", { p_ip: ip, p_ok: ok });
  if (!ok) return { error: GENERIC };

  (await cookies()).set(ADMIN_COOKIE, signSession(Date.now() + SESSION_MS, cfg.secret), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/admin",
    maxAge: SESSION_MS / 1000,
  });
  redirect("/admin");
}

export async function logout(): Promise<void> {
  (await cookies()).set(ADMIN_COOKIE, "", { path: "/admin", maxAge: 0 });
  redirect("/admin/login");
}
