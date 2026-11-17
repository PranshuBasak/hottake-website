import "server-only";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, adminConfig, verifySession } from "./admin-auth";

export async function isAdmin(): Promise<boolean> {
  await connection();
  const cfg = adminConfig();
  if (!cfg) return false;
  return verifySession((await cookies()).get(ADMIN_COOKIE)?.value, cfg.secret);
}

/** Call first in every admin page and server action. Proxy also checks, but this is the real gate. */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) redirect("/admin/login");
}
