/** Feedback types and helpers that are safe to use in the browser. */
export type FeedbackComment = { id: number; name: string; body: string; created_at: string; edited_at: string | null; mine: boolean };
export type Feedback = { up: number; down: number; mine: -1 | 1 | null; total_comments: number; comments: FeedbackComment[] };

export const NAME_MAX = 40;
export const BODY_MAX = 1000;

export function likedPercent(up: number, down: number): number | null {
  const total = up + down;
  return total ? Math.round((up / total) * 100) : null;
}
