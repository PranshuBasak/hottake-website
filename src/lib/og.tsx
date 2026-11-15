import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { site } from "./site";

export const OG_SIZE = { width: 1200, height: 630 };

const C = {
  bg: "#120d0b",
  text: "#f6ece3",
  muted: "#c9b8aa",
  ember: "#ff6b4f",
  amber: "#ffa94d",
  ink: "#1a120d",
  seats: ["#ff5d73", "#3ec1ff", "#ffd23f", "#7ee081"],
};

/** Reads a file from /public as a data URL (for <img> inside ImageResponse). */
export async function publicDataUrl(path: string): Promise<string> {
  const buf = await readFile(join(process.cwd(), "public", path));
  const type = path.endsWith(".svg") ? "image/svg+xml" : "image/png";
  return `data:${type};base64,${buf.toString("base64")}`;
}

/** Brand fonts for ImageResponse (woff, OFL; see src/assets/fonts). Cards are prerendered at build time. */
export async function ogFonts() {
  const dir = join(process.cwd(), "src", "assets", "fonts");
  const [head, body, bodyBold] = await Promise.all([
    readFile(join(dir, "bricolage-grotesque-latin-800-normal.woff")),
    readFile(join(dir, "atkinson-hyperlegible-latin-400-normal.woff")),
    readFile(join(dir, "atkinson-hyperlegible-latin-700-normal.woff")),
  ]);
  return [
    { name: "Bricolage", data: head, weight: 800 as const, style: "normal" as const },
    { name: "Atkinson", data: body, weight: 400 as const, style: "normal" as const },
    { name: "Atkinson", data: bodyBold, weight: 700 as const, style: "normal" as const },
  ];
}

const domain = site.url.replace(/^https?:\/\//, "");

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        overflow: "hidden",
        background: `radial-gradient(70% 90% at 88% 10%, #ff6b4f 0%, #7a2a1c 32%, ${C.bg} 68%)`,
        color: C.text,
        fontFamily: "Atkinson",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: -200,
          bottom: -260,
          width: 700,
          height: 700,
          borderRadius: 700,
          background: "radial-gradient(circle, rgba(255,169,77,0.22), rgba(255,169,77,0) 65%)",
          display: "flex",
        }}
      />
      {children}
    </div>
  );
}

function Logo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <div
        style={{
          width: 46,
          height: 30,
          borderRadius: 16,
          background: "#221a17",
          border: `2px solid ${C.ember}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 7px",
          position: "relative",
        }}
      >
        <div style={{ width: 7, height: 7, borderRadius: 7, background: C.seats[1], display: "flex" }} />
        <div
          style={{
            position: "absolute",
            left: 12,
            top: -18,
            width: 18,
            height: 26,
            borderRadius: 12,
            background: `linear-gradient(180deg, #ffd35c, ${C.ember})`,
            display: "flex",
          }}
        />
        <div style={{ width: 7, height: 7, borderRadius: 7, background: C.seats[2], display: "flex" }} />
      </div>
      <div style={{ fontFamily: "Bricolage", fontSize: 30, fontWeight: 800, letterSpacing: -0.5 }}>HotTake</div>
    </div>
  );
}

function Cta({ label }: { label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          background: C.ember,
          color: C.ink,
          fontWeight: 700,
          fontSize: 28,
          padding: "16px 30px",
          borderRadius: 999,
          whiteSpace: "nowrap",
          flexShrink: 0,
          boxShadow: "0 18px 40px -12px rgba(255,107,79,0.8)",
        }}
      >
        {label}
      </div>
      <div style={{ display: "flex", fontSize: 24, color: C.muted, whiteSpace: "nowrap" }}>{domain}</div>
    </div>
  );
}

function Chip({ children, color }: { children: React.ReactNode; color?: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 18px",
        borderRadius: 999,
        border: "1.5px solid rgba(246,236,227,0.18)",
        background: "rgba(18,13,11,0.55)",
        fontSize: 22,
        fontWeight: 700,
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}
    >
      {color && <div style={{ width: 10, height: 10, borderRadius: 10, background: color, display: "flex" }} />}
      {children}
    </div>
  );
}

function Phone({ color, x, y, rotate }: { color: string; x: number; y: number; rotate: number }) {
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 118,
        height: 220,
        borderRadius: 26,
        background: "#0b0807",
        border: "2px solid rgba(246,236,227,0.2)",
        padding: 8,
        display: "flex",
        transform: `rotate(${rotate}deg)`,
        boxShadow: `0 30px 60px -20px ${color}`,
      }}
    >
      <div style={{ flex: 1, borderRadius: 18, background: "#221a17", display: "flex", flexDirection: "column", alignItems: "center", overflow: "hidden" }}>
        <div style={{ width: "100%", height: 12, background: color, display: "flex" }} />
        <div style={{ marginTop: 34, width: 62, height: 62, position: "relative", display: "flex" }}>
          <div style={{ position: "absolute", left: 21, top: 0, width: 20, height: 62, borderRadius: 6, background: "#3a2c26", display: "flex" }} />
          <div style={{ position: "absolute", left: 0, top: 21, width: 62, height: 20, borderRadius: 6, background: "#3a2c26", display: "flex" }} />
        </div>
        <div style={{ marginTop: 26, display: "flex", gap: 16 }}>
          <div style={{ width: 28, height: 28, borderRadius: 28, background: color, display: "flex" }} />
          <div style={{ width: 28, height: 28, borderRadius: 28, border: `3px solid ${color}`, display: "flex" }} />
        </div>
      </div>
    </div>
  );
}

function Cover({ src, x, y, w, rotate }: { src: string; x: number; y: number; w: number; rotate: number }) {
  const h = Math.round((w * 9) / 16);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      width={w}
      height={h}
      alt=""
      style={{
        position: "absolute",
        left: x,
        top: y,
        borderRadius: 22,
        border: "3px solid rgba(246,236,227,0.85)",
        transform: `rotate(${rotate}deg)`,
        boxShadow: "0 30px 70px -20px rgba(0,0,0,0.85)",
      }}
    />
  );
}

/** The site-wide card: headline, stats, CTA, fanned game covers and a phone controller. */
export function HomeOg({ covers }: { covers: string[] }) {
  return (
    <Frame>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "54px 0 54px 64px", width: 640 }}>
        <Logo />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontFamily: "Bricolage", fontSize: 72, fontWeight: 800, lineHeight: 0.98, letterSpacing: -2.5 }}>
            Your laptop is the console.
          </div>
          <div style={{ display: "flex", fontFamily: "Bricolage", fontSize: 72, fontWeight: 800, lineHeight: 0.98, letterSpacing: -2.5, color: C.amber, marginTop: 8 }}>
            Every phone is a controller.
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 30 }}>
            <Chip color={C.seats[0]}>32 games</Chip>
            <Chip color={C.seats[1]}>1–8 players</Chip>
            <Chip color={C.seats[3]}>No app to install</Chip>
          </div>
        </div>
        <Cta label="Free for Windows →" />
      </div>
      <div style={{ position: "relative", display: "flex", flex: 1 }}>
        <Cover src={covers[0]} x={60} y={50} w={420} rotate={-9} />
        <Cover src={covers[1]} x={110} y={200} w={420} rotate={4} />
        <Cover src={covers[2]} x={40} y={350} w={420} rotate={-3} />
        <Phone color={C.seats[0]} x={360} y={320} rotate={12} />
      </div>
    </Frame>
  );
}

/** A game's card: its cover big and tilted, name, pitch, players and controls, and a CTA. */
export function GameOg({
  name,
  tagline,
  players,
  controls,
  coop,
  cover,
}: {
  name: string;
  tagline: string;
  players: string;
  controls: string;
  coop: boolean;
  cover: string;
}) {
  return (
    <Frame>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "54px 0 54px 64px", width: 610 }}>
        <Logo />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 22, letterSpacing: 5, color: C.amber, textTransform: "uppercase", fontWeight: 700 }}>
            {coop ? "Co-op party game" : "Party game"}
          </div>
          <div
            style={{
              display: "flex",
              fontFamily: "Bricolage",
              fontSize: name.length > 14 ? 72 : 92,
              fontWeight: 800,
              lineHeight: 0.95,
              letterSpacing: -3,
              marginTop: 12,
            }}
          >
            {name}
          </div>
          <div style={{ display: "flex", fontSize: 28, color: C.muted, marginTop: 18, lineHeight: 1.3 }}>{tagline}</div>
          <div style={{ display: "flex", gap: 12, marginTop: 26 }}>
            <Chip color={C.seats[2]}>{players} players</Chip>
            <Chip color={C.seats[1]}>{controls.split(" · ").slice(0, 3).join(" · ")}</Chip>
          </div>
        </div>
        <Cta label="Play it free →" />
      </div>
      <div style={{ position: "relative", display: "flex", flex: 1 }}>
        <Cover src={cover} x={20} y={150} w={540} rotate={-6} />
        <Phone color={C.seats[3]} x={420} y={330} rotate={10} />
      </div>
    </Frame>
  );
}
