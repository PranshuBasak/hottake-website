import { NextResponse, type NextRequest } from "next/server";
import { ensureAuthorKey, hashAuthor, readAuthorKey } from "@/lib/author";
import { isKnownGame, parseVote } from "@/lib/feedback";
import { getAdmin } from "@/lib/supabase/admin";

/** Body `{ value: 1 | -1 | 0 }`: thumbs up, thumbs down, or remove your own vote. */
export async function POST(req: NextRequest, ctx: RouteContext<"/api/games/[id]/vote">) {
  const { id } = await ctx.params;
  if (!isKnownGame(id)) return NextResponse.json({ error: "Unknown game" }, { status: 404 });
  const value = parseVote(((await req.json().catch(() => ({}))) as { value?: unknown }).value);
  if (value === null) return NextResponse.json({ error: "Invalid vote" }, { status: 400 });
  const admin = getAdmin();
  if (!admin) return NextResponse.json({ error: "Unavailable" }, { status: 503 });

  const res = NextResponse.json({});
  const key = ensureAuthorKey(req, res, readAuthorKey(req));
  const { data, error } = await admin.rpc("cast_vote", {
    p_game: id,
    p_author: hashAuthor(key)!,
    p_value: value,
    p_country: req.headers.get("x-vercel-ip-country"),
  });
  if (error || !data?.[0]) return NextResponse.json({ error: "Unavailable" }, { status: 503 });
  return NextResponse.json(data[0], { headers: res.headers });
}
