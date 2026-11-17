import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

/** Pure admin auth helpers (no Next.js imports, so they are easy to test and safe to use in proxy). */

export const ADMIN_COOKIE = "ht_admin";
export const SESSION_MS = 12 * 60 * 60 * 1000;

const KEYLEN = 64;

export function hashPassword(pw: string): string {
  const salt = randomBytes(16);
  return `${salt.toString("hex")}:${scryptSync(pw, salt, KEYLEN).toString("hex")}`;
}

export function verifyPassword(pw: string, stored: string): boolean {
  const [saltHex, hashHex] = stored.split(":");
  if (!saltHex || !hashHex || !/^[0-9a-f]+$/i.test(saltHex + hashHex)) return false;
  const expected = Buffer.from(hashHex, "hex");
  if (expected.length !== KEYLEN) return false;
  const actual = scryptSync(pw, Buffer.from(saltHex, "hex"), KEYLEN);
  return timingSafeEqual(actual, expected);
}

/** Constant-time string comparison that also hides length differences. */
export function safeEqual(a: string, b: string): boolean {
  const ka = createHmac("sha256", "cmp").update(a).digest();
  const kb = createHmac("sha256", "cmp").update(b).digest();
  return timingSafeEqual(ka, kb);
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

/** Token is `<expiry ms>.<hmac>`. Holding a valid token is the whole session; there is nothing to look up. */
export function signSession(expMs: number, secret: string): string {
  const exp = String(Math.floor(expMs));
  return `${exp}.${sign(exp, secret)}`;
}

export function verifySession(token: string | undefined, secret: string, now = Date.now()): boolean {
  if (!token || secret.length < 16) return false;
  const [exp, sig] = token.split(".");
  if (!exp || !sig || !/^\d{10,16}$/.test(exp)) return false;
  const a = Buffer.from(sig);
  const b = Buffer.from(sign(exp, secret));
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  return Number(exp) > now;
}

export type AdminConfig = { username: string; passwordHash: string; secret: string };

/** Null when the admin area is not configured; it then stays locked for everyone. */
export function adminConfig(env: NodeJS.ProcessEnv = process.env): AdminConfig | null {
  const username = env.ADMIN_USERNAME?.trim();
  const passwordHash = env.ADMIN_PASSWORD_HASH?.trim();
  const secret = env.ADMIN_SESSION_SECRET?.trim();
  if (!username || !passwordHash || !secret || secret.length < 16) return null;
  return { username, passwordHash, secret };
}
