import { z } from "zod";
import type { Consent } from "./consent";

export const EVENT_NAMES = [
  "page_view",
  "page_leave",
  "download_click",
  "subscribe",
  "cta_click",
  "game_view",
  "outbound_link",
  "filter_games",
] as const;
export type EventName = (typeof EVENT_NAMES)[number];

const short = (n: number) => z.string().trim().max(n);

export const trackPayloadSchema = z.object({
  name: z.enum(EVENT_NAMES),
  path: short(300),
  referrer: short(500).optional(),
  utm: z
    .object({
      source: short(100).optional(),
      medium: short(100).optional(),
      campaign: short(100).optional(),
      term: short(100).optional(),
      content: short(100).optional(),
    })
    .optional(),
  props: z.record(z.string().max(40), z.union([z.string().max(200), z.number(), z.boolean(), z.null()])).optional(),
  client: z
    .object({
      languages: z.array(short(35)).max(10).optional(),
      timezone: short(60).optional(),
      screen: short(20).optional(),
      viewport: short(20).optional(),
      pixelRatio: z.number().min(0).max(10).optional(),
      colorScheme: z.enum(["dark", "light"]).optional(),
      reducedMotion: z.boolean().optional(),
      cpuCores: z.number().int().min(0).max(1024).optional(),
      deviceMemory: z.number().min(0).max(1024).optional(),
      connection: short(20).optional(),
      touch: z.boolean().optional(),
    })
    .optional(),
});
export type TrackPayload = z.infer<typeof trackPayloadSchema>;

export type UaInfo = {
  browser?: string;
  browserVersion?: string;
  os?: string;
  osVersion?: string;
  deviceType?: string;
  deviceVendor?: string;
  deviceModel?: string;
  isBot: boolean;
};

export type TrackContext = {
  consent: Consent | null;
  ip: string | null;
  userAgent: string | null;
  ua: UaInfo;
  geo: { country?: string; region?: string; city?: string };
  visitorId: string | null;
  sessionId: string | null;
  newSession: boolean;
};

export type TrackRecord = {
  visitor: { id?: string; new_visit?: boolean };
  session: Record<string, unknown>;
  event: { name: EventName; path: string; props: Record<string, unknown> };
};

/** Drops query strings and fragments so URLs with tokens never get stored. */
export function cleanPath(path: string): string {
  const p = path.split(/[?#]/)[0] || "/";
  return (p.startsWith("/") ? p : `/${p}`).slice(0, 300);
}

/**
 * Pure: turns a client payload + request context into the rows `track_hit` stores.
 * Anything that identifies a person is only included when consent is "all".
 */
export function buildTrackRecord(p: TrackPayload, ctx: TrackContext): TrackRecord {
  const event = { name: p.name, path: cleanPath(p.path), props: p.props ?? {} };
  if (ctx.consent !== "all" || !ctx.visitorId || !ctx.sessionId) return { visitor: {}, session: {}, event };

  const visitor = { id: ctx.visitorId, new_visit: ctx.newSession };
  if (!ctx.newSession) return { visitor, session: { id: ctx.sessionId }, event };

  const c = p.client ?? {};
  const session = {
    id: ctx.sessionId,
    ip: ctx.ip,
    country: ctx.geo.country ?? null,
    region: ctx.geo.region ?? null,
    city: ctx.geo.city ?? null,
    user_agent: ctx.userAgent?.slice(0, 500) ?? null,
    browser: ctx.ua.browser ?? null,
    browser_version: ctx.ua.browserVersion ?? null,
    os: ctx.ua.os ?? null,
    os_version: ctx.ua.osVersion ?? null,
    device_type: ctx.ua.deviceType ?? "desktop",
    device_vendor: ctx.ua.deviceVendor ?? null,
    device_model: ctx.ua.deviceModel ?? null,
    is_bot: ctx.ua.isBot,
    languages: c.languages ?? null,
    timezone: c.timezone ?? null,
    screen: c.screen ?? null,
    viewport: c.viewport ?? null,
    pixel_ratio: c.pixelRatio ?? null,
    color_scheme: c.colorScheme ?? null,
    reduced_motion: c.reducedMotion ?? null,
    cpu_cores: c.cpuCores ?? null,
    device_memory: c.deviceMemory ?? null,
    connection: c.connection ?? null,
    touch: c.touch ?? null,
    referrer: p.referrer || null,
    landing_path: event.path,
    utm_source: p.utm?.source ?? null,
    utm_medium: p.utm?.medium ?? null,
    utm_campaign: p.utm?.campaign ?? null,
    utm_term: p.utm?.term ?? null,
    utm_content: p.utm?.content ?? null,
  };
  return { visitor, session, event };
}

/** First address from x-forwarded-for (Vercel puts the client first). */
export function clientIp(forwardedFor: string | null, realIp: string | null): string | null {
  const first = forwardedFor?.split(",")[0]?.trim();
  const ip = first || realIp?.trim() || null;
  return ip && /^[0-9a-fA-F:.]{3,45}$/.test(ip) ? ip : null;
}
