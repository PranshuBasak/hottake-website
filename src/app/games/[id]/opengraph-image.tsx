import { ImageResponse } from "next/og";
import { controlsLabel, getGame, getGames, playersLabel } from "@/lib/games";
import { GameOg, HomeOg, OG_SIZE, ogFonts, publicDataUrl } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "HotTake game";

export function generateStaticParams() {
  return getGames().map((g) => ({ id: g.id }));
}

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const fonts = await ogFonts();
  const g = getGame(id);
  if (!g) {
    const covers = await Promise.all(["/games/coin-clash.svg", "/games/sushi-paws.svg", "/games/night-siege.svg"].map(publicDataUrl));
    return new ImageResponse(<HomeOg covers={covers} />, { ...size, fonts });
  }
  const cover = await publicDataUrl(g.cover);
  return new ImageResponse(
    <GameOg name={g.name} tagline={g.tagline} players={playersLabel(g)} controls={controlsLabel(g)} coop={g.coop} cover={cover} />,
    { ...size, fonts },
  );
}
