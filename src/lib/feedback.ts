import { createHash } from "node:crypto";
import { BODY_MAX, NAME_MAX } from "./feedback-shared";
import { getGame } from "./games";

export { BODY_MAX, likedPercent, NAME_MAX, type Feedback, type FeedbackComment } from "./feedback-shared";

export type CommentInput = { ok: true; name: string; body: string } | { ok: false; error: string };

export function isKnownGame(id: string): boolean {
  return /^[a-z0-9-]{2,40}$/.test(id) && !!getGame(id);
}

/** Plain-text comment validation. Markup is kept as text; it is rendered as text, never as HTML. */
export function validateComment(input: { name?: unknown; body?: unknown; company?: unknown }): CommentInput {
  if (typeof input.company === "string" && input.company.trim() !== "") return { ok: false, error: "bot" };
  const name = typeof input.name === "string" ? input.name.trim().replace(/\s+/g, " ") : "";
  const body = typeof input.body === "string" ? input.body.trim() : "";
  if (!name) return { ok: false, error: "Add a name to post." };
  if (name.length > NAME_MAX) return { ok: false, error: `Names can be up to ${NAME_MAX} characters.` };
  if (!body) return { ok: false, error: "Write a message first." };
  if (body.length > BODY_MAX) return { ok: false, error: `Messages can be up to ${BODY_MAX} characters.` };
  return { ok: true, name, body };
}

export function parseVote(v: unknown): -1 | 0 | 1 | null {
  return v === 1 || v === -1 || v === 0 ? v : null;
}

export function authorHash(key: string, pepper: string): string {
  return createHash("sha256").update(`${key}:${pepper}`).digest("hex");
}

