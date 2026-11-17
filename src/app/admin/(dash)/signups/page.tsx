import type { Metadata } from "next";
import { Suspense } from "react";
import { TrendChart } from "@/components/admin/charts";
import { adminFilters } from "@/components/admin/page-filters";
import { Pager } from "@/components/admin/pager";
import { dateTime, ErrorNote, Kpi, Loading, PageHeader, Panel, Table } from "@/components/admin/ui";
import { filtersToQuery } from "@/lib/admin-filters";
import { loadSignups, PAGE_SIZE } from "@/lib/admin-data";

export const metadata: Metadata = { title: "Sign-ups" };

export default function SignupsPage({ searchParams }: PageProps<"/admin/signups">) {
  return (
    <>
      <PageHeader title="Sign-ups">Email subscribers, newest first.</PageHeader>
      <Suspense fallback={<Loading />}>
        <Signups searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Signups({ searchParams }: Pick<PageProps<"/admin/signups">, "searchParams">) {
  const { f, bar } = await adminFilters(searchParams, ["q"], "Search emails");
  const r = await loadSignups(f);
  if (!r.ok) return <div className="space-y-6">{bar}<ErrorNote message={r.error} /></div>;
  const s = r.data;
  return (
    <div className="space-y-6">
      {bar}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <Kpi label="Sign-ups" value={s.total} />
      </div>
      <Panel title="Sign-ups per day">
        <TrendChart data={s.daily} series={[{ key: "signups", label: "Sign-ups", color: "var(--ok)" }]} />
      </Panel>
      <Panel title={`Subscribers (${s.total})`}>
        <Table head={["Email", "Signed up", "Source", "Status"]} empty={!s.rows.length}>
          {s.rows.map((row) => (
            <tr key={row.email + row.created_at}>
              <td className="px-4 py-3 font-medium break-all">{row.email}</td>
              <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{dateTime(row.created_at)}</td>
              <td className="px-4 py-3 text-muted-foreground">{row.source ?? "–"}</td>
              <td className="px-4 py-3">
                {row.unsubscribed ? (
                  <span className="rounded-full bg-white/8 px-2 py-0.5 text-xs text-muted-foreground">Unsubscribed</span>
                ) : (
                  <span className="rounded-full bg-ok/15 px-2 py-0.5 text-xs text-ok">Subscribed</span>
                )}
              </td>
            </tr>
          ))}
        </Table>
        <Pager page={f.page} total={s.total} pageSize={PAGE_SIZE} base={filtersToQuery(f, { page: null })} />
      </Panel>
    </div>
  );
}
