import { NextResponse, type NextRequest } from "next/server";
import { hashAuthor, readAuthorKey } from "@/lib/author";
import { isKnownGame } from "@/lib/feedback";
import { getAdmin } from "@/lib/supabase/admin";

/** Counts, the caller's vote, and a page of comments (newest first). `?before=<id>` loads older ones. */
export async function GET(req: NextRequest, ctx: RouteContext<"/api/games/[id]/feedback">) {
  const { id } = await ctx.params;
  if (!isKnownGame(id)) return NextResponse.json({ error: "Unknown game" }, { status: 404 });
  const admin = getAdmin();
  if (!admin) return NextResponse.json({ error: "Unavailable" }, { status: 503 });

  const before = Number(req.nextUrl.searchParams.get("before"));
  const { data, error } = await admin.rpc("game_feedback", {
    p_game: id,
    p_author: hashAuthor(readAuthorKey(req)),
    p_limit: 20,
    p_before: Number.isInteger(before) && before > 0 ? before : null,
  });
  if (error) return NextResponse.json({ error: "Unavailable" }, { status: 503 });
  return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
}
