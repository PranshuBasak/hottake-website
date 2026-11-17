// @vitest-environment jsdom
import { render, screen, waitFor } from "@testing-library/react";
import { createAgent } from "@ui-sdk/react/agent";
import { beforeEach, expect, test, vi } from "vitest";
import { FilterBar } from "./filter-bar";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

const agent = createAgent();

const options = {
  country: ["DE", "IN", "US"],
  device: ["desktop", "mobile", "tablet"],
  path: ["/", "/games"],
  game: [{ value: "beetle-ball", label: "Beetle Ball" }],
};

beforeEach(() => push.mockReset());

test("an agent can set the date range and filters, and filters that don't apply are disabled", async () => {
  render(<FilterBar query={{ page: "3" }} options={options} dims={["country", "device", "path"]} />);

  const components = agent.snapshot().filter((e) => !e.offPage && e.component !== "more");
  for (const e of components) expect(e.label, `${e.component} ${e.ref} has no name`).toBeTruthy();
  const labels = components.map((e) => e.label);
  for (const label of ["Date range", "Country", "Device", "Page", "Game"]) {
    expect(labels, `${label} is missing from the snapshot`).toContain(label);
  }
  expect(screen.getByRole("combobox", { name: "Game" }).hasAttribute("disabled")).toBe(true);
  expect(screen.getByRole("combobox", { name: "Country" }).hasAttribute("disabled")).toBe(false);

  const r1 = await agent.act({ steps: [{ ref: "Country", action: "setValue", args: ["IN"] }] });
  expect(r1.ok, r1.error?.message).toBe(true);
  // Changing a filter keeps the others and goes back to page 1.
  await waitFor(() => expect(push).toHaveBeenLastCalledWith("?country=IN", { scroll: false }));

  const r2 = await agent.act({ steps: [{ ref: "Date range", action: "setValue", args: ["7d"] }] });
  expect(r2.ok, r2.error?.message).toBe(true);
  await waitFor(() => expect(push).toHaveBeenLastCalledWith("?range=7d", { scroll: false }));
});

test("choosing All clears a filter", async () => {
  render(<FilterBar query={{ country: "IN", range: "7d" }} options={options} dims={["country"]} />);
  const r = await agent.act({ steps: [{ ref: "Country", action: "setValue", args: ["__all"] }] });
  expect(r.ok, r.error?.message).toBe(true);
  await waitFor(() => expect(push).toHaveBeenLastCalledWith("?range=7d", { scroll: false }));
});
