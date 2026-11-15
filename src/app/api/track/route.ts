import { NextResponse, userAgent, type NextRequest } from "next/server";
import { randomUUID } from "node:crypto";
import {
  CONSENT_COOKIE,
  LAST_VISIT_COOKIE,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  VISITOR_COOKIE,
  CONSENT_MAX_AGE,
  parseConsent,
} from "@/lib/consent";
import { buildTrackRecord, clientIp, trackPayloadSchema } from "@/lib/track";
import { getAdmin } from "@/lib/supabase/admin";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function geoHeader(req: NextRequest, name: string): string | undefined {
  const v = req.headers.get(name);
  return v ? decodeURIComponent(v).slice(0, 80) : undefined;
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new NextResponse(null, { status: 400 });
  }
  const parsed = trackPayloadSchema.safeParse(body);
  if (!parsed.success) return new NextResponse(null, { status: 400 });

  const consent = parseConsent(req.cookies.get(CONSENT_COOKIE)?.value);
  const res = new NextResponse(null, { status: 204 });
  const secure = req.nextUrl.protocol === "https:";

  let visitorId: string | null = null;
  let sessionId: string | null = null;
  let newSession = false;

  if (consent === "all") {
    const vid = req.cookies.get(VISITOR_COOKIE)?.value;
    const sid = req.cookies.get(SESSION_COOKIE)?.value;
    visitorId = vid && UUID.test(vid) ? vid : randomUUID();
    newSession = !(sid && UUID.test(sid));
    sessionId = newSession ? randomUUID() : sid!;
    const base = { path: "/", sameSite: "lax" as const, secure, httpOnly: true };
    res.cookies.set(VISITOR_COOKIE, visitorId, { ...base, maxAge: CONSENT_MAX_AGE });
    res.cookies.set(SESSION_COOKIE, sessionId, { ...base, maxAge: SESSION_MAX_AGE });
    res.cookies.set(LAST_VISIT_COOKIE, new Date().toISOString(), { ...base, httpOnly: false, maxAge: CONSENT_MAX_AGE });
  } else {
    // Make sure nothing identifying lingers after consent is withdrawn.
    for (const name of [VISITOR_COOKIE, SESSION_COOKIE, LAST_VISIT_COOKIE]) {
      if (req.cookies.has(name)) res.cookies.delete(name);
    }
  }

  const ua = userAgent(req);
  const record = buildTrackRecord(parsed.data, {
    consent,
    ip: clientIp(req.headers.get("x-forwarded-for"), req.headers.get("x-real-ip")),
    userAgent: req.headers.get("user-agent"),
    ua: {
      browser: ua.browser.name,
      browserVersion: ua.browser.version,
      os: ua.os.name,
      osVersion: ua.os.version,
      deviceType: ua.device.type,
      deviceVendor: ua.device.vendor,
      deviceModel: ua.device.model,
      isBot: ua.isBot,
    },
    geo: {
      country: geoHeader(req, "x-vercel-ip-country"),
      region: geoHeader(req, "x-vercel-ip-country-region"),
      city: geoHeader(req, "x-vercel-ip-city"),
    },
    visitorId,
    sessionId,
    newSession,
  });

  if (ua.isBot) return res;

  const admin = getAdmin();
  if (admin) {
    const { error } = await admin.rpc("track_hit", {
      p_visitor: record.visitor,
      p_session: record.session,
      p_event: record.event,
    });
    if (error) console.error("track_hit failed:", error.message);
  }
  return res;
}
