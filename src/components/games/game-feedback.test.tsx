// @vitest-environment jsdom
import { act, render, screen, waitFor } from "@testing-library/react";
import { createAgent } from "@ui-sdk/react/agent";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { GameFeedback } from "./game-feedback";

const agent = createAgent();
let calls: { url: string; method: string; body: unknown }[] = [];

beforeEach(() => {
  calls = [];
  localStorage.clear();
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, opts: RequestInit = {}) => {
      const body = opts.body ? JSON.parse(String(opts.body)) : undefined;
      calls.push({ url, method: opts.method ?? "GET", body });
      const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { "content-type": "application/json" } });
      if (url.endsWith("/feedback")) {
        return json({
          up: 4,
          down: 1,
          mine: null,
          total_comments: 1,
          comments: [{ id: 1, name: "Sam", body: "<b>not bold</b>", created_at: "2026-11-17T10:00:00Z", edited_at: null, mine: false }],
        });
      }
      if (url.endsWith("/vote")) return json({ up: 5, down: 1, mine: 1 });
      if (url.endsWith("/comments")) {
        return json({ status: "ok", comment: { id: 2, name: body.name, body: body.body, created_at: new Date().toISOString(), edited_at: null, mine: true } }, 201);
      }
      return json({ error: "nope" }, 404);
    }),
  );
});

afterEach(() => vi.unstubAllGlobals());

test("an agent can find every control, vote and post a comment", async () => {
  render(<GameFeedback gameId="beetle-ball" gameName="Beetle Ball" />);
  await screen.findByText("80% of players liked it.");

  const components = agent.snapshot().filter((e) => !e.offPage && e.component !== "more");
  for (const e of components) expect(e.label, `${e.component} ${e.ref} has no name`).toBeTruthy();
  const labels = components.map((e) => e.label);
  for (const label of ["I like this game", "Not for me", "Your name", "Comment", "Post comment"]) {
    expect(labels, `${label} is missing from the snapshot`).toContain(label);
  }

  const result = await agent.act({
    steps: [
      { ref: "I like this game", action: "setPressed", args: [true] },
      { ref: "Your name", action: "setValue", args: ["Ana"] },
      { ref: "Comment", action: "setValue", args: ["Loved it"] },
      { ref: "Post comment", action: "press" },
    ],
  });
  expect(result.ok, result.error?.message).toBe(true);

  await waitFor(() => expect(screen.getByText("Loved it")).toBeTruthy());
  expect(calls.find((c) => c.url.endsWith("/vote"))?.body).toEqual({ value: 1 });
  expect(calls.find((c) => c.url.endsWith("/comments"))?.body).toEqual({ name: "Ana", body: "Loved it", company: "" });
  expect(screen.getByRole("button", { name: "I like this game" }).getAttribute("aria-pressed")).toBe("true");
  expect(localStorage.getItem("ht_comment_name")).toBe("Ana");
});

test("comment bodies render as text, and empty fields are caught before sending", async () => {
  render(<GameFeedback gameId="beetle-ball" gameName="Beetle Ball" />);
  expect(await screen.findByText("<b>not bold</b>")).toBeTruthy();
  expect(document.querySelector("b")).toBeNull();

  await act(async () => {
    screen.getByRole("button", { name: "Post comment" }).click();
  });
  expect(await screen.findByText("Add a name to post.")).toBeTruthy();
  expect(calls.some((c) => c.method === "POST")).toBe(false);
  expect(screen.queryByRole("button", { name: "Edit" })).toBeNull();
});
