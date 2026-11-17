import { describe, expect, it } from "vitest";
import { hashPassword, safeEqual, signSession, verifyPassword, verifySession } from "./admin-auth";

const secret = "test-secret-that-is-long-enough-0123456789";

describe("admin passwords", () => {
  it("verifies the password it hashed", () => {
    const stored = hashPassword("correct horse");
    expect(stored).toMatch(/^[0-9a-f]{32}:[0-9a-f]{128}$/);
    expect(verifyPassword("correct horse", stored)).toBe(true);
  });

  it("rejects a wrong password and malformed hashes", () => {
    const stored = hashPassword("correct horse");
    expect(verifyPassword("battery staple", stored)).toBe(false);
    expect(verifyPassword("correct horse", "nonsense")).toBe(false);
    expect(verifyPassword("correct horse", "")).toBe(false);
  });

  it("compares strings without leaking length mismatches as errors", () => {
    expect(safeEqual("admin", "admin")).toBe(true);
    expect(safeEqual("admin", "admin2")).toBe(false);
    expect(safeEqual("", "")).toBe(true);
  });
});

describe("admin sessions", () => {
  const now = 1_800_000_000_000;

  it("accepts a fresh session", () => {
    expect(verifySession(signSession(now + 1000, secret), secret, now)).toBe(true);
  });

  it("rejects an expired session", () => {
    expect(verifySession(signSession(now - 1, secret), secret, now)).toBe(false);
  });

  it("rejects a tampered session", () => {
    const token = signSession(now + 1000, secret);
    const last = token.at(-1) === "a" ? "b" : "a";
    expect(verifySession(token.slice(0, -1) + last, secret, now)).toBe(false);
    const [exp, sig] = token.split(".");
    expect(verifySession(`${Number(exp) + 999999}.${sig}`, secret, now)).toBe(false);
  });

  it("rejects missing, malformed or wrongly signed sessions", () => {
    expect(verifySession(undefined, secret, now)).toBe(false);
    expect(verifySession("", secret, now)).toBe(false);
    expect(verifySession("abc", secret, now)).toBe(false);
    expect(verifySession(signSession(now + 1000, "another-secret-entirely-0123456789"), secret, now)).toBe(false);
  });

  it("refuses to work without a usable secret", () => {
    expect(verifySession(signSession(now + 1000, secret), "", now)).toBe(false);
  });
});
