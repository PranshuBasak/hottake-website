import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const OG_SIZE = { width: 1200, height: 630 };

/** Reads a file from /public as a data URL (for <img> inside ImageResponse). */
export async function publicDataUrl(path: string): Promise<string> {
  const buf = await readFile(join(process.cwd(), "public", path));
  const type = path.endsWith(".svg") ? "image/svg+xml" : "image/png";
  return `data:${type};base64,${buf.toString("base64")}`;
}

/** Shared OG card: warm gradient, wordmark, big title, optional art on the right. */
export function OgCard({ eyebrow, title, subtitle, art }: { eyebrow: string; title: string; subtitle: string; art?: string }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: "radial-gradient(circle at 80% 20%, #ff6b4f 0%, #3a1712 35%, #120d0b 70%)",
        color: "#f6ece3",
        fontFamily: "sans-serif",
        padding: 64,
        gap: 48,
        alignItems: "center",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
        <div style={{ display: "flex", fontSize: 26, color: "#ffa94d", letterSpacing: 6, textTransform: "uppercase" }}>{eyebrow}</div>
        <div style={{ display: "flex", fontSize: title.length > 28 ? 64 : 84, fontWeight: 800, lineHeight: 1.02, marginTop: 20 }}>{title}</div>
        <div style={{ display: "flex", fontSize: 30, color: "#b5a396", marginTop: 24, lineHeight: 1.3 }}>{subtitle}</div>
        <div style={{ display: "flex", fontSize: 30, fontWeight: 800, marginTop: 40, color: "#ff6b4f" }}>HotTake</div>
      </div>
      {art && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={art} width={480} height={270} style={{ borderRadius: 24, border: "2px solid rgba(246,236,227,0.15)" }} alt="" />
      )}
    </div>
  );
}
