import { describe, expect, it } from "vitest";
import { buildTrackRecord, clientIp, trackPayloadSchema } from "./track";

const payload = trackPayloadSchema.parse({
  name: "page_view",
  path: "/games?x=1",
  referrer: "https://news.ycombinator.com/",
  utm: { source: "hn", medium: "social" },
  client: {
    languages: ["en-IN", "en"],
    timezone: "Asia/Kolkata",
    screen: "1920x1080",
    viewport: "1440x900",
    pixelRatio: 2,
    colorScheme: "dark",
    reducedMotion: false,
    cpuCores: 8,
    deviceMemory: 8,
    connection: "4g",
    touch: false,
  },
});
const ctx = {
  ip: "203.0.113.9",
  userAgent: "Mozilla/5.0",
  ua: { browser: "Chrome", browserVersion: "130", os: "Windows", osVersion: "11", isBot: false },
  geo: { country: "IN", region: "MH", city: "Mumbai" },
  visitorId: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  sessionId: "1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed",
  newSession: true,
};

describe("buildTrackRecord", () => {
  it("with full consent keeps device, location and ids", () => {
    const r = buildTrackRecord(payload, { ...ctx, consent: "all" });
    expect(r.visitor).toEqual({ id: ctx.visitorId, new_visit: true });
    expect(r.session).toMatchObject({
      id: ctx.sessionId,
      ip: "203.0.113.9",
      country: "IN",
      city: "Mumbai",
      browser: "Chrome",
      os: "Windows",
      device_type: "desktop",
      timezone: "Asia/Kolkata",
      screen: "1920x1080",
      utm_source: "hn",
      landing_path: "/games",
    });
    expect(r.event).toEqual({ name: "page_view", path: "/games", props: {} });
  });
  it("essential consent strips identifiers", () => {
    const r = buildTrackRecord(payload, { ...ctx, consent: "essential" });
    expect(r.visitor).toEqual({});
    expect(r.session).toEqual({});
    expect(r.event).toEqual({ name: "page_view", path: "/games", props: {} });
    expect(JSON.stringify(r)).not.toContain("203.0.113.9");
  });
  it("no choice yet behaves like essential", () => {
    expect(buildTrackRecord(payload, { ...ctx, consent: null }).session).toEqual({});
  });
  it("only sends session details on a new session", () => {
    const r = buildTrackRecord(payload, { ...ctx, consent: "all", newSession: false });
    expect(r.session).toEqual({ id: ctx.sessionId });
    expect(r.visitor).toEqual({ id: ctx.visitorId, new_visit: false });
  });
  it("rejects unknown event names", () => {
    expect(trackPayloadSchema.safeParse({ name: "drop_table", path: "/" }).success).toBe(false);
  });
});

describe("clientIp", () => {
  it("takes the first forwarded address", () => expect(clientIp("203.0.113.9, 10.0.0.1", null)).toBe("203.0.113.9"));
  it("ignores garbage", () => expect(clientIp("<script>", null)).toBeNull());
});
