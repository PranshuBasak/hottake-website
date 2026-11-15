import { CreatorTeaser, FinalCta } from "@/components/home/closing";
import { Features } from "@/components/home/features";
import { GameStrip } from "@/components/home/game-strip";
import { Hero } from "@/components/home/hero";
import { HowItWorks } from "@/components/home/how-it-works";
import { getGames } from "@/lib/games";

export default function HomePage() {
  // Pass the client components only what they draw, so the page's inline data stays small.
  const games = getGames().map(({ id, name, cover, players }) => ({ id, name, cover, players }));
  // Lead the laptop mock-up with the most colourful covers.
  const featured = ["coin-clash", "bombermoji", "sushi-paws", "night-siege", "tangle", "star-convoy", "putt-panic", "paint-the-plaza"];
  const covers = featured.map((id) => games.find((g) => g.id === id)!).filter(Boolean).map(({ id, name, cover }) => ({ id, name, cover }));
  return (
    <>
      <Hero covers={covers} />
      <GameStrip games={games} />
      <HowItWorks />
      <Features />
      <CreatorTeaser />
      <FinalCta />
    </>
  );
}
