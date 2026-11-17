import { NextResponse, type NextRequest } from "next/server";
import { hashAuthor, readAuthorKey } from "@/lib/author";
import { isKnownGame, validateComment } from "@/lib/feedback";
import { getAdmin } from "@/lib/supabase/admin";

/** Edit your own comment. Only the browser holding the author key that posted it can; nobody can delete. */
export async function PATCH(req: NextRequest, ctx: RouteContext<"/api/games/[id]/comments/[commentId]">) {
  const { id, commentId } = await ctx.params;
  const cid = Number(commentId);
  if (!isKnownGame(id) || !Number.isInteger(cid) || cid < 1) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const author = hashAuthor(readAuthorKey(req));
  if (!author) return NextResponse.json({ error: "Only the browser that posted this comment can edit it." }, { status: 403 });
  const v = validateComment(await req.json().catch(() => ({})));
  if (!v.ok) return NextResponse.json({ error: v.error === "bot" ? "Invalid request" : v.error }, { status: 400 });
  const admin = getAdmin();
  if (!admin) return NextResponse.json({ error: "Comments are unavailable right now." }, { status: 503 });

  const { data, error } = await admin.rpc("edit_comment", { p_id: cid, p_author: author, p_name: v.name, p_body: v.body });
  if (error) return NextResponse.json({ error: "Comments are unavailable right now." }, { status: 503 });
  if (data?.status === "not_found") return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (data?.status === "forbidden") return NextResponse.json({ error: "Only the browser that posted this comment can edit it." }, { status: 403 });
  return NextResponse.json(data);
}
