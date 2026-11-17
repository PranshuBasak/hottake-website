import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, adminConfig, verifySession } from "@/lib/admin-auth";

/** Keeps signed-out visitors away from the admin pages and tells crawlers to stay out. */
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isLogin = pathname === "/admin/login";
  const cfg = adminConfig();
  const ok = !!cfg && verifySession(req.cookies.get(ADMIN_COOKIE)?.value, cfg.secret);

  let res: NextResponse;
  if (!ok && !isLogin) res = NextResponse.redirect(new URL("/admin/login", req.url));
  else if (ok && isLogin) res = NextResponse.redirect(new URL("/admin", req.url));
  else res = NextResponse.next();

  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  res.headers.set("Cache-Control", "private, no-store");
  return res;
}

export const config = { matcher: ["/admin", "/admin/:path*"] };
