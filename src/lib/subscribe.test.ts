import { describe, expect, it } from "vitest";
import { subscribeMessage, validateSubscribe } from "./subscribe";

describe("validateSubscribe", () => {
  it("accepts and normalises a real address", () => {
    expect(validateSubscribe({ email: "  Pranshu@Example.COM ", company: "" })).toEqual({ ok: true, email: "pranshu@example.com" });
  });
  it("rejects malformed addresses", () => {
    expect(validateSubscribe({ email: "not-an-email" })).toEqual({ ok: false, error: "That doesn't look like an email address." });
    expect(validateSubscribe({ email: "" }).ok).toBe(false);
  });
  it("treats a filled honeypot as a bot", () => {
    expect(validateSubscribe({ email: "a@b.co", company: "ACME" })).toEqual({ ok: false, error: "bot" });
  });
  it("rejects absurdly long input", () => {
    expect(validateSubscribe({ email: `${"a".repeat(250)}@b.co` }).ok).toBe(false);
  });
});

describe("subscribeMessage", () => {
  it("is friendly for duplicates", () => expect(subscribeMessage("already")).toMatch(/already on the list/));
  it("explains rate limits", () => expect(subscribeMessage("rate_limited")).toMatch(/too many/i));
});
