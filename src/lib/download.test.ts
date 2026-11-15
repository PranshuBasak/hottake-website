import { describe, expect, it } from "vitest";
import { formatBytes, resolveDownload } from "./download";

describe("resolveDownload", () => {
  it("sends people to the release file", () => {
    const url = "https://x.supabase.co/storage/v1/object/public/releases/a.exe";
    expect(resolveDownload({ id: 1, url })).toBe(url);
  });
  it("falls back to the download page when there is no release", () => {
    expect(resolveDownload(null)).toBe("/download?error=unavailable");
  });
  it("refuses non-https URLs", () => {
    expect(resolveDownload({ id: 1, url: "javascript:alert(1)" })).toBe("/download?error=unavailable");
  });
});

describe("formatBytes", () => {
  it("formats megabytes", () => expect(formatBytes(12480255)).toBe("11.9 MB"));
});
