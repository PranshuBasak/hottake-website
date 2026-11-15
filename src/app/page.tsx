import { CreatorTeaser, FinalCta } from "@/components/home/closing";
import { Features } from "@/components/home/features";
import { GameStrip } from "@/components/home/game-strip";
import { Hero } from "@/components/home/hero";
import { HowItWorks } from "@/components/home/how-it-works";
import { getGames } from "@/lib/games";

export default function HomePage() {
  const games = getGames();
  // Lead the laptop mock-up with the most colourful covers.
  const featured = ["coin-clash", "bombermoji", "sushi-paws", "night-siege", "tangle", "star-convoy", "putt-panic", "paint-the-plaza"];
  const covers = featured.map((id) => games.find((g) => g.id === id)!).filter(Boolean);
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
