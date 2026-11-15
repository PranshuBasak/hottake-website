import { describe, expect, it } from "vitest";
import { CONSENT_COOKIE, effectiveConsent, parseConsent } from "./consent";

describe("consent", () => {
  it("parses stored choices", () => {
    expect(parseConsent("all")).toBe("all");
    expect(parseConsent("essential")).toBe("essential");
  });
  it("treats missing or junk as no choice", () => {
    expect(parseConsent(undefined)).toBeNull();
    expect(parseConsent("yes please")).toBeNull();
  });
  it("Do Not Track / GPC default to essential when no choice was made", () => {
    expect(effectiveConsent(null, { gpc: true })).toBe("essential");
    expect(effectiveConsent(null, { dnt: true })).toBe("essential");
    expect(effectiveConsent(null, {})).toBeNull();
  });
  it("an explicit choice wins over browser signals", () => {
    expect(effectiveConsent("all", { gpc: true })).toBe("all");
  });
  it("uses the documented cookie name", () => expect(CONSENT_COOKIE).toBe("ht_consent"));
});
