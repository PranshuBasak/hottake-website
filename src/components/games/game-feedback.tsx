"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MessageSquare, ThumbsDown, ThumbsUp } from "lucide-react";
import { Button } from "@ui-sdk/react/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@ui-sdk/react/field";
import { Input } from "@ui-sdk/react/input";
import { Textarea } from "@ui-sdk/react/textarea";
import { Toggle, ToggleGroup, ToggleIcon } from "@ui-sdk/react/toggle";
import { BODY_MAX, likedPercent, NAME_MAX, type Feedback, type FeedbackComment } from "@/lib/feedback-shared";
import { playSound } from "@/lib/sound";
import { cn } from "@/lib/utils";

const NAME_KEY = "ht_comment_name";

const fieldInput =
  "w-full rounded-xl border border-border bg-bg-0 px-4 py-2.5 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus-visible:border-amber data-invalid:border-destructive";
const primaryButton =
  "inline-flex h-11 items-center justify-center gap-2 rounded-full bg-ember px-6 font-semibold text-[#1a120d] transition-[background,transform] hover:bg-amber active:scale-[0.97] data-pending:opacity-70 data-disabled:opacity-60";
const ghostButton =
  "inline-flex h-9 items-center rounded-full border border-border px-4 text-sm font-semibold transition-colors hover:border-white/30 data-pending:opacity-70";

function ago(iso: string): string {
  const s = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  const steps: [number, string][] = [[60, "s"], [60, "min"], [24, "h"], [30, "d"], [12, "mo"]];
  let v = s;
  for (const [n, unit] of steps) {
    if (v < n) return `${v} ${unit} ago`;
    v = Math.floor(v / n);
  }
  return `${v} y ago`;
}

/** Votes and comments for one game. Loads after the static page, so the page itself stays prerendered. */
export function GameFeedback({ gameId, gameName }: { gameId: string; gameName: string }) {
  const [data, setData] = useState<Feedback | null>(null);
  const [failed, setFailed] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const box = useRef<HTMLElement>(null);

  useEffect(() => {
    let alive = true;
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        fetch(`/api/games/${gameId}/feedback`, { cache: "no-store" })
          .then((r) => (r.ok ? r.json() : Promise.reject()))
          .then((d: Feedback) => alive && setData(d))
          .catch(() => alive && setFailed(true));
      },
      { rootMargin: "400px" },
    );
    io.observe(el);
    return () => {
      alive = false;
      io.disconnect();
    };
  }, [gameId]);

  const loadMore = useCallback(async () => {
    if (!data?.comments.length) return;
    setLoadingMore(true);
    const before = data.comments[data.comments.length - 1].id;
    const r = await fetch(`/api/games/${gameId}/feedback?before=${before}`, { cache: "no-store" }).catch(() => null);
    if (r?.ok) {
      const more = (await r.json()) as Feedback;
      setData((d) => (d ? { ...d, comments: [...d.comments, ...more.comments] } : d));
    }
    setLoadingMore(false);
  }, [data, gameId]);

  return (
    <section ref={box} aria-labelledby="feedback-title" data-sound="custom" className="container-site py-12">
      <div className="grid gap-10 rounded-[2rem] border border-border bg-bg-1 p-6 sm:p-10 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <h2 id="feedback-title" className="text-2xl font-bold">
            What do you think of {gameName}?
          </h2>
          <p className="mt-2 text-muted-foreground">One vote per browser. Tap again to take it back.</p>
          {failed ? (
            <p className="mt-6 text-sm text-muted-foreground">Votes and comments are unavailable right now.</p>
          ) : (
            <VoteBar gameId={gameId} data={data} onChange={(v) => setData((d) => (d ? { ...d, ...v } : d))} />
          )}
        </div>
        <div>
          <h3 className="flex items-center gap-2 text-lg font-bold">
            <MessageSquare className="size-4 text-amber" aria-hidden /> Comments
            {data && <span className="text-sm font-normal text-muted-foreground">({data.total_comments})</span>}
          </h3>
          {data && (
            <CommentForm
              gameId={gameId}
              onPosted={(c) => setData((d) => (d ? { ...d, total_comments: d.total_comments + 1, comments: [c, ...d.comments] } : d))}
            />
          )}
          <CommentList
            gameId={gameId}
            comments={data?.comments ?? null}
            onEdited={(c) => setData((d) => (d ? { ...d, comments: d.comments.map((x) => (x.id === c.id ? c : x)) } : d))}
          />
          {data && data.comments.length < data.total_comments && (
            <Button onClick={loadMore} disabled={loadingMore} className={cn(ghostButton, "mt-6")}>
              {loadingMore ? "Loading…" : "Load older comments"}
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}

function VoteBar({
  gameId,
  data,
  onChange,
}: {
  gameId: string;
  data: Feedback | null;
  onChange: (v: Pick<Feedback, "up" | "down" | "mine">) => void;
}) {
  const [busy, setBusy] = useState(false);
  const mine = data?.mine ?? null;
  const pct = data ? likedPercent(data.up, data.down) : null;

  const send = async (value: -1 | 0 | 1) => {
    if (!data) return;
    const prev = { up: data.up, down: data.down, mine: data.mine };
    // optimistic update, reverted if the server says no
    const next = { ...prev };
    if (prev.mine === 1) next.up--;
    if (prev.mine === -1) next.down--;
    if (value === 1) next.up++;
    if (value === -1) next.down++;
    next.mine = value === 0 ? null : value;
    onChange(next);
    playSound(value === -1 ? "vote-down" : value === 1 ? "vote-up" : "click");
    setBusy(true);
    const r = await fetch(`/api/games/${gameId}/vote`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ value }),
    }).catch(() => null);
    setBusy(false);
    if (!r?.ok) {
      onChange(prev);
      playSound("error");
      return;
    }
    const d = (await r.json()) as { up: number; down: number; mine: -1 | 1 | null };
    onChange({ up: d.up, down: d.down, mine: d.mine });
  };

  const value = mine === 1 ? ["up"] : mine === -1 ? ["down"] : [];
  const toggleCls =
    "inline-flex h-14 min-w-28 items-center justify-center gap-2.5 rounded-2xl border border-border bg-bg-0 px-5 text-lg font-bold transition-[background,border-color,transform] hover:border-white/30 active:scale-[0.97] data-disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-amber";

  return (
    <div className="mt-6">
      <ToggleGroup
        aria-label="Vote on this game"
        value={value}
        deselectable
        disabled={!data || busy}
        onValueChange={(v) => void send(v[0] === "up" ? 1 : v[0] === "down" ? -1 : 0)}
        className="flex gap-3"
      >
        <Toggle value="up" aria-label="I like this game" className={cn(toggleCls, "data-pressed:border-ok data-pressed:bg-ok/15 data-pressed:text-ok")}>
          <ToggleIcon>
            <ThumbsUp className="size-5" />
          </ToggleIcon>
          <span className="tabular-nums">{data?.up ?? "–"}</span>
        </Toggle>
        <Toggle value="down" aria-label="Not for me" className={cn(toggleCls, "data-pressed:border-destructive data-pressed:bg-destructive/15 data-pressed:text-destructive")}>
          <ToggleIcon>
            <ThumbsDown className="size-5" />
          </ToggleIcon>
          <span className="tabular-nums">{data?.down ?? "–"}</span>
        </Toggle>
      </ToggleGroup>
      <p className="mt-4 text-sm text-muted-foreground" aria-live="polite">
        {pct === null ? "No votes yet. Be the first." : `${pct}% of players liked it.`}
      </p>
      {pct !== null && (
        <div className="mt-2 h-2 w-full max-w-xs overflow-hidden rounded-full bg-destructive/40" aria-hidden>
          <div className="h-full rounded-full bg-ok transition-[width] duration-500" style={{ width: `${pct}%` }} />
        </div>
      )}
    </div>
  );
}

function CommentForm({ gameId, onPosted }: { gameId: string; onPosted: (c: FeedbackComment) => void }) {
  // Only mounted after feedback has loaded (post-hydration), so reading storage here is safe.
  const [name, setName] = useState(() => {
    try {
      return localStorage.getItem(NAME_KEY) ?? "";
    } catch {
      return "";
    }
  });
  const [body, setBody] = useState("");
  const [error, setError] = useState<{ field: "name" | "body"; message: string } | null>(null);
  const [pending, setPending] = useState(false);
  const company = useRef<HTMLInputElement>(null);

  const submit = async () => {
    if (pending) return;
    const problem = !name.trim() ? "Add a name to post." : !body.trim() ? "Write a message first." : null;
    setError(problem ? { field: problem.startsWith("Add a name") ? "name" : "body", message: problem } : null);
    if (problem) return playSound("error");
    setPending(true);
    const r = await fetch(`/api/games/${gameId}/comments`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, body, company: company.current?.value ?? "" }),
    }).catch(() => null);
    const d = r ? await r.json().catch(() => ({})) : {};
    setPending(false);
    if (!r?.ok) {
      const message: string = d.error ?? "Couldn't post that. Try again in a moment.";
      setError({ field: /name/i.test(message) ? "name" : "body", message });
      playSound("error");
      return;
    }
    try {
      localStorage.setItem(NAME_KEY, name.trim());
    } catch {}
    if (d.comment) onPosted(d.comment as FeedbackComment);
    setBody("");
    playSound("post");
  };

  return (
    <form
      className="mt-5 space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
      noValidate
    >
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Company <input ref={company} type="text" name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <Field invalid={error?.field === "name"}>
        <FieldLabel className="mb-1.5 block text-sm font-semibold">Your name</FieldLabel>
        <Input value={name} onValueChange={setName} maxLength={NAME_MAX} autoComplete="nickname" required className={fieldInput} />
        {error?.field === "name" && <FieldError className="mt-1.5 block text-sm text-destructive">{error.message}</FieldError>}
      </Field>
      <Field invalid={error?.field === "body"}>
        <FieldLabel className="mb-1.5 block text-sm font-semibold">Comment</FieldLabel>
        <Textarea
          value={body}
          onValueChange={setBody}
          maxLength={BODY_MAX}
          rows={3}
          autoResize
          required
          submitShortcut="mod+enter"
          className={cn(fieldInput, "min-h-24 max-h-64 resize-none")}
        />
        <FieldDescription className="mt-1.5 flex justify-between text-xs text-muted-foreground">
          <span>Plain text. Comments can be edited from this browser but never deleted.</span>
          <span className="tabular-nums">
            {body.length}/{BODY_MAX}
          </span>
        </FieldDescription>
        {error?.field === "body" && <FieldError className="mt-1.5 block text-sm text-destructive">{error.message}</FieldError>}
      </Field>
      <Button type="submit" disabled={pending} focusableWhenDisabled className={primaryButton}>
        {pending ? "Posting…" : "Post comment"}
      </Button>
    </form>
  );
}

function CommentList({
  gameId,
  comments,
  onEdited,
}: {
  gameId: string;
  comments: FeedbackComment[] | null;
  onEdited: (c: FeedbackComment) => void;
}) {
  if (comments === null) return <p className="mt-6 text-sm text-muted-foreground">Loading comments…</p>;
  if (!comments.length) return <p className="mt-6 text-sm text-muted-foreground">No comments yet. Say something nice.</p>;
  return (
    <ul className="mt-8 space-y-4">
      {comments.map((c) => (
        <CommentItem key={c.id} gameId={gameId} comment={c} onEdited={onEdited} />
      ))}
    </ul>
  );
}

function CommentItem({ gameId, comment: c, onEdited }: { gameId: string; comment: FeedbackComment; onEdited: (c: FeedbackComment) => void }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(c.name);
  const [body, setBody] = useState(c.body);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const save = async () => {
    if (pending) return;
    setError(null);
    setPending(true);
    const r = await fetch(`/api/games/${gameId}/comments/${c.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, body }),
    }).catch(() => null);
    const d = r ? await r.json().catch(() => ({})) : {};
    setPending(false);
    if (!r?.ok) {
      setError(d.error ?? "Couldn't save. Try again.");
      playSound("error");
      return;
    }
    onEdited(d.comment as FeedbackComment);
    setEditing(false);
    playSound("post");
  };

  return (
    <li className="rounded-2xl border border-border bg-bg-0/60 p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-semibold">
          {c.name}
          {c.mine && <span className="ml-2 rounded-full bg-amber/15 px-2 py-0.5 text-xs text-amber">you</span>}
        </p>
        <p className="text-xs text-muted-foreground">
          {ago(c.created_at)}
          {c.edited_at && ` · edited ${ago(c.edited_at)}`}
        </p>
      </div>
      {editing ? (
        <form
          className="mt-3 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            void save();
          }}
        >
          <Field>
            <FieldLabel className="sr-only">Name</FieldLabel>
            <Input value={name} onValueChange={setName} maxLength={NAME_MAX} className={fieldInput} />
          </Field>
          <Field invalid={!!error}>
            <FieldLabel className="sr-only">Comment</FieldLabel>
            <Textarea value={body} onValueChange={setBody} maxLength={BODY_MAX} autoResize className={cn(fieldInput, "min-h-20 max-h-64 resize-none")} />
            {error && <FieldError className="mt-1 block text-sm text-destructive">{error}</FieldError>}
          </Field>
          <div className="flex gap-2">
            <Button type="submit" disabled={pending} focusableWhenDisabled className={cn(primaryButton, "h-9 px-4 text-sm")}>
              {pending ? "Saving…" : "Save"}
            </Button>
            <Button
              type="button"
              onClick={() => {
                setEditing(false);
                setName(c.name);
                setBody(c.body);
                setError(null);
              }}
              className={ghostButton}
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <>
          <p className="mt-2 whitespace-pre-wrap break-words text-muted-foreground">{c.body}</p>
          {c.mine && (
            <Button
              type="button"
              onClick={() => {
                setEditing(true);
                playSound("click");
              }}
              className="mt-2 text-sm font-semibold text-amber hover:underline"
            >
              Edit
            </Button>
          )}
        </>
      )}
    </li>
  );
}
