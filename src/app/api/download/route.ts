import { NextResponse, userAgent, type NextRequest } from "next/server";
import { CONSENT_COOKIE, VISITOR_COOKIE, parseConsent } from "@/lib/consent";
import { DOWNLOAD_FALLBACK, resolveDownload } from "@/lib/download";
import { getLatestRelease } from "@/lib/releases";
import { getAdmin } from "@/lib/supabase/admin";
import { clientIp } from "@/lib/track";

/** Logs the download (anonymously unless the visitor consented), then redirects to the installer. */
export async function GET(req: NextRequest) {
  const release = await getLatestRelease();
  const target = resolveDownload(release);
  if (target === DOWNLOAD_FALLBACK) return NextResponse.redirect(new URL(target, req.url), 302);

  const consented = parseConsent(req.cookies.get(CONSENT_COOKIE)?.value) === "all";
  const admin = getAdmin();
  if (admin && !userAgent(req).isBot) {
    const country = req.headers.get("x-vercel-ip-country");
    const { error } = await admin.rpc("log_download", {
      p_release_id: release!.id,
      p_visitor_id: consented ? (req.cookies.get(VISITOR_COOKIE)?.value ?? null) : null,
      p_ip: consented ? clientIp(req.headers.get("x-forwarded-for"), req.headers.get("x-real-ip")) : null,
      p_country: country ?? null,
      p_referrer: consented ? (req.headers.get("referer") ?? null) : null,
    });
    if (error) console.error("log_download failed:", error.message);
  }
  return NextResponse.redirect(target, 302);
}
