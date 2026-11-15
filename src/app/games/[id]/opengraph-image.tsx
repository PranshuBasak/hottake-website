import { ImageResponse } from "next/og";
import { getGame, getGames, playersLabel } from "@/lib/games";
import { OG_SIZE, OgCard, publicDataUrl } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "HotTake game";

export function generateStaticParams() {
  return getGames().map((g) => ({ id: g.id }));
}

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const g = getGame(id);
  if (!g) return new ImageResponse(<OgCard eyebrow="HotTake" title="Party games" subtitle="Phones are the controllers." />, size);
  const art = await publicDataUrl(g.cover);
  return new ImageResponse(
    <OgCard eyebrow={`${playersLabel(g)} players${g.coop ? " · co-op" : ""}`} title={g.name} subtitle={g.tagline} art={art} />,
    size,
  );
}
