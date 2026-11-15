import type { Metadata } from "next";
import { share } from "@/lib/share";
import { Catalogue } from "@/components/games/catalogue";
import { SplitHeading } from "@/components/site/reveal";
import { ShaderBg } from "@/components/site/shader-bg";
import { allTags, getGames } from "@/lib/games";
import { JsonLd, breadcrumbLd } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "All 32 party games",
  description:
    "Every game that ships with HotTake: platform brawls, bluffing dice, rhythm races, mini golf and co-op survival for 1–8 players, all controlled from your phones.",
  alternates: { canonical: "/games" },
  ...share({ path: "/games", title: "All 32 HotTake party games", description: "Brawls, bluffs, rhythm races, mini golf and co-op survival for 1 to 8 players, played on your phones." }),
};

export default function GamesPage() {
  const games = getGames();
  return (
    <>
      <JsonLd
        data={[
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Games", path: "/games" },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "HotTake games",
            numberOfItems: games.length,
            itemListElement: games.map((g, i) => ({ "@type": "ListItem", position: i + 1, url: absoluteUrl(`/games/${g.id}`), name: g.name })),
          },
        ]}
      />
      <section className="grain relative isolate overflow-hidden pt-36 pb-14">
        <ShaderBg variant="dusk" />
        <div className="container-site relative">
          <p className="eyebrow mb-4">The catalogue</p>
          <SplitHeading as="h1" onScroll={false} className="max-w-4xl text-5xl font-extrabold sm:text-7xl">
            {games.length} games, already on the shelf.
          </SplitHeading>
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
            Every one of them ships inside the installer, so there&apos;s nothing to buy or download later. Filter by how many of you
            there are tonight.
          </p>
        </div>
      </section>
      <section className="container-site pb-16">
        <Catalogue games={games} tags={allTags()} />
      </section>
    </>
  );
}
