import { NextResponse, type NextRequest } from "next/server";
import { ensureAuthorKey, hashAuthor, readAuthorKey } from "@/lib/author";
import { isKnownGame, validateComment } from "@/lib/feedback";
import { getAdmin } from "@/lib/supabase/admin";
import { clientIp } from "@/lib/track";

/** Body `{ name, body, company }` (`company` is the hidden bot trap). */
export async function POST(req: NextRequest, ctx: RouteContext<"/api/games/[id]/comments">) {
  const { id } = await ctx.params;
  if (!isKnownGame(id)) return NextResponse.json({ error: "Unknown game" }, { status: 404 });
  const v = validateComment(await req.json().catch(() => ({})));
  if (!v.ok) {
    // Bots get a quiet success and learn nothing.
    if (v.error === "bot") return NextResponse.json({ status: "ok" });
    return NextResponse.json({ error: v.error }, { status: 400 });
  }
  const admin = getAdmin();
  if (!admin) return NextResponse.json({ error: "Comments are unavailable right now." }, { status: 503 });

  const res = NextResponse.json({});
  const key = ensureAuthorKey(req, res, readAuthorKey(req));
  const { data, error } = await admin.rpc("post_comment", {
    p_game: id,
    p_author: hashAuthor(key)!,
    p_name: v.name,
    p_body: v.body,
    p_ip: clientIp(req.headers.get("x-forwarded-for"), req.headers.get("x-real-ip")),
    p_country: req.headers.get("x-vercel-ip-country"),
  });
  if (error) return NextResponse.json({ error: "Comments are unavailable right now." }, { status: 503 });
  if (data?.status === "rate_limited") {
    return NextResponse.json({ error: "You're posting fast. Take a breather and try again in a few minutes." }, { status: 429 });
  }
  return NextResponse.json(data, { status: 201, headers: res.headers });
}
