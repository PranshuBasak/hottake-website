import { describe, expect, it } from "vitest";
import { authorHash, isKnownGame, parseVote, validateComment } from "./feedback";

describe("isKnownGame", () => {
  it("accepts a built-in game", () => expect(isKnownGame("coin-clash")).toBe(true));
  it("rejects anything else", () => {
    expect(isKnownGame("nope")).toBe(false);
    expect(isKnownGame("../coin-clash")).toBe(false);
  });
});

describe("validateComment", () => {
  it("trims and accepts a normal comment", () => {
    expect(validateComment({ name: " Ana ", body: " gg " })).toEqual({ ok: true, name: "Ana", body: "gg" });
  });
  it("keeps markup as literal text", () => {
    const r = validateComment({ name: "x", body: "<script>alert(1)</script>" });
    expect(r).toEqual({ ok: true, name: "x", body: "<script>alert(1)</script>" });
  });
  it("needs a name and a message", () => {
    expect(validateComment({ name: "", body: "hi" }).ok).toBe(false);
    expect(validateComment({ name: "Ana", body: "   " }).ok).toBe(false);
  });
  it("enforces length limits", () => {
    expect(validateComment({ name: "a".repeat(41), body: "hi" }).ok).toBe(false);
    expect(validateComment({ name: "Ana", body: "b".repeat(1001) }).ok).toBe(false);
    expect(validateComment({ name: "a".repeat(40), body: "b".repeat(1000) }).ok).toBe(true);
  });
  it("treats a filled honeypot as a bot", () => {
    expect(validateComment({ name: "Ana", body: "hi", company: "ACME" })).toEqual({ ok: false, error: "bot" });
  });
});

describe("parseVote", () => {
  it("accepts up, down and remove", () => {
    expect(parseVote(1)).toBe(1);
    expect(parseVote(-1)).toBe(-1);
    expect(parseVote(0)).toBe(0);
  });
  it("rejects other values", () => {
    expect(parseVote(2)).toBeNull();
    expect(parseVote("1")).toBeNull();
    expect(parseVote(null)).toBeNull();
  });
});

describe("authorHash", () => {
  it("is 64 hex chars and stable", () => {
    const a = authorHash("k", "p");
    expect(a).toMatch(/^[0-9a-f]{64}$/);
    expect(authorHash("k", "p")).toBe(a);
    expect(authorHash("k", "q")).not.toBe(a);
  });
});
