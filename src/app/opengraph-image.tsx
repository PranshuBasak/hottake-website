import { ImageResponse } from "next/og";
import { OG_SIZE, OgCard, publicDataUrl } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "HotTake — your laptop is the console, every phone is a controller";

export default async function Image() {
  const art = await publicDataUrl("/games/coin-clash.svg");
  return new ImageResponse(
    <OgCard
      eyebrow="Party games · Windows · Free"
      title="Every phone is a controller."
      subtitle="32 games for 1–8 players. Scan a QR code and play. No app install."
      art={art}
    />,
    size,
  );
}
