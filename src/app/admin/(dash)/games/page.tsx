import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { VotesChart } from "@/components/admin/charts";
import { adminFilters } from "@/components/admin/page-filters";
import { ErrorNote, Kpi, Loading, num, PageHeader, Panel, Table } from "@/components/admin/ui";
import { loadGames } from "@/lib/admin-data";

export const metadata: Metadata = { title: "Games" };

export default function GamesPage({ searchParams }: PageProps<"/admin/games">) {
  return (
    <>
      <PageHeader title="Games">Thumbs up, thumbs down and comments for every game.</PageHeader>
      <Suspense fallback={<Loading />}>
        <Games searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Games({ searchParams }: Pick<PageProps<"/admin/games">, "searchParams">) {
  const { f, bar } = await adminFilters(searchParams, ["country"]);
  const r = await loadGames(f);
  if (!r.ok) return <div className="space-y-6">{bar}<ErrorNote message={r.error} /></div>;
  const rows = [...r.data].sort((a, b) => b.up + b.down - (a.up + a.down) || b.comments - a.comments || a.name.localeCompare(b.name));
  const up = rows.reduce((n, g) => n + g.up, 0);
  const down = rows.reduce((n, g) => n + g.down, 0);
  const comments = rows.reduce((n, g) => n + g.comments, 0);
  const voted = rows.filter((g) => g.up + g.down > 0);
  return (
    <div className="space-y-6">
      {bar}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Kpi label="Thumbs up" value={up} />
        <Kpi label="Thumbs down" value={down} />
        <Kpi label="Comments" value={comments} />
        <Kpi label="Games with votes" value={voted.length} />
      </div>
      <Panel title="Votes per game" note="Games nobody has voted on are left out of the chart.">
        <VotesChart data={voted.slice(0, 20).map((g) => ({ name: g.name, up: g.up, down: g.down }))} />
      </Panel>
      <Panel title="All games">
        <Table head={["Game", "Thumbs up", "Thumbs down", "Liked", "Comments"]}>
          {rows.map((g) => (
            <tr key={g.game_id}>
              <td className="px-4 py-3 font-medium">
                <Link href={`/games/${g.game_id}`} className="hover:text-amber hover:underline">
                  {g.name}
                </Link>
              </td>
              <td className="px-4 py-3 tabular-nums text-ok">{num(g.up)}</td>
              <td className="px-4 py-3 tabular-nums text-destructive">{num(g.down)}</td>
              <td className="px-4 py-3 tabular-nums">{g.liked === null ? "–" : `${g.liked}%`}</td>
              <td className="px-4 py-3 tabular-nums">
                {g.comments ? (
                  <Link href={`/admin/comments?game=${g.game_id}`} className="text-amber hover:underline">
                    {num(g.comments)}
                  </Link>
                ) : (
                  "0"
                )}
              </td>
            </tr>
          ))}
        </Table>
      </Panel>
    </div>
  );
}
