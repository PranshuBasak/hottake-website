import { ImageResponse } from "next/og";
import { HomeOg, OG_SIZE, ogFonts, publicDataUrl } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "HotTake: your laptop is the console, every phone is a controller";

export default async function Image() {
  const [fonts, ...covers] = await Promise.all([
    ogFonts(),
    publicDataUrl("/games/coin-clash.svg"),
    publicDataUrl("/games/sushi-paws.svg"),
    publicDataUrl("/games/night-siege.svg"),
  ]);
  return new ImageResponse(<HomeOg covers={covers as string[]} />, { ...size, fonts });
}
