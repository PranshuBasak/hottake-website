import "server-only";
import { randomUUID } from "node:crypto";
import type { NextRequest, NextResponse } from "next/server";
import { authorHash } from "./feedback";

export const AUTHOR_COOKIE = "ht_author";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function pepper(): string {
  const p = process.env.AUTHOR_PEPPER || process.env.SUPABASE_SECRET_KEY;
  if (!p) throw new Error("AUTHOR_PEPPER (or SUPABASE_SECRET_KEY) is not set");
  return p;
}

/** The browser's author key, if it has a valid one. */
export function readAuthorKey(req: NextRequest): string | null {
  const k = req.cookies.get(AUTHOR_COOKIE)?.value;
  return k && UUID.test(k) ? k : null;
}

export function hashAuthor(key: string | null): string | null {
  return key ? authorHash(key, pepper()) : null;
}

/** Returns the key to use, creating one (and setting the cookie on `res`) when the browser has none. */
export function ensureAuthorKey(req: NextRequest, res: NextResponse, existing: string | null): string {
  const key = existing ?? randomUUID();
  if (!existing) {
    res.cookies.set(AUTHOR_COOKIE, key, {
      httpOnly: true,
      secure: req.nextUrl.protocol === "https:",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }
  return key;
}
