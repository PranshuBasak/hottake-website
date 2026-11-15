import { describe, expect, it } from "vitest";
import { overallStatus, timed } from "./health";

describe("overallStatus", () => {
  const critical = ["database"] as const;
  it("is ok when everything is ok", () => {
    expect(overallStatus({ database: { status: "ok" }, storage: { status: "ok" } }, critical)).toBe("ok");
  });
  it("is down when a critical check is down", () => {
    expect(overallStatus({ database: { status: "down" }, storage: { status: "ok" } }, critical)).toBe("down");
  });
  it("is degraded when a non-critical check fails", () => {
    expect(overallStatus({ database: { status: "ok" }, storage: { status: "down" } }, critical)).toBe("degraded");
  });
});

describe("timed", () => {
  it("reports failures as down with the message", async () => {
    const c = await timed(async () => {
      throw new Error("boom");
    });
    expect(c).toMatchObject({ status: "down", detail: "boom" });
  });
  it("times out slow checks", async () => {
    const c = await timed(() => new Promise(() => {}), 20);
    expect(c).toMatchObject({ status: "down", detail: "timed out after 20 ms" });
  });
});
