import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { adminFilters } from "@/components/admin/page-filters";
import { Pager } from "@/components/admin/pager";
import { dateTime, ErrorNote, Loading, PageHeader, Panel, Table } from "@/components/admin/ui";
import { filtersToQuery } from "@/lib/admin-filters";
import { loadComments, PAGE_SIZE } from "@/lib/admin-data";
import { getGame } from "@/lib/games";

export const metadata: Metadata = { title: "Comments" };

export default function CommentsPage({ searchParams }: PageProps<"/admin/comments">) {
  return (
    <>
      <PageHeader title="Comments">
        Every comment, newest first. Read-only: to remove one for legal reasons, delete the row in Supabase.
      </PageHeader>
      <Suspense fallback={<Loading />}>
        <Comments searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Comments({ searchParams }: Pick<PageProps<"/admin/comments">, "searchParams">) {
  const { f, bar } = await adminFilters(searchParams, ["country", "game", "q"], "Search comments");
  const r = await loadComments(f);
  if (!r.ok) return <div className="space-y-6">{bar}<ErrorNote message={r.error} /></div>;
  const c = r.data;
  return (
    <div className="space-y-6">
      {bar}
      <Panel title={`Comments (${c.total})`}>
        <Table head={["Game", "Name", "Comment", "Country", "Posted"]} empty={!c.rows.length}>
          {c.rows.map((row) => (
            <tr key={row.id} className="align-top">
              <td className="px-4 py-3 whitespace-nowrap">
                <Link href={`/games/${row.game_id}`} className="font-medium hover:text-amber hover:underline">
                  {getGame(row.game_id)?.name ?? row.game_id}
                </Link>
              </td>
              <td className="px-4 py-3 font-medium break-words">{row.name}</td>
              <td className="max-w-md px-4 py-3 whitespace-pre-wrap break-words text-muted-foreground">{row.body}</td>
              <td className="px-4 py-3">{row.country ?? "–"}</td>
              <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                {dateTime(row.created_at)}
                {row.edited_at && <span className="block text-xs">edited {dateTime(row.edited_at)}</span>}
              </td>
            </tr>
          ))}
        </Table>
        <Pager page={f.page} total={c.total} pageSize={PAGE_SIZE} base={filtersToQuery(f, { page: null })} />
      </Panel>
    </div>
  );
}
