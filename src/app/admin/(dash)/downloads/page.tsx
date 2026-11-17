import type { Metadata } from "next";
import { Suspense } from "react";
import { RankChart, TrendChart } from "@/components/admin/charts";
import { adminFilters } from "@/components/admin/page-filters";
import { ErrorNote, Kpi, Loading, PageHeader, Panel } from "@/components/admin/ui";
import { loadDownloads } from "@/lib/admin-data";

export const metadata: Metadata = { title: "Downloads" };

export default function DownloadsPage({ searchParams }: PageProps<"/admin/downloads">) {
  return (
    <>
      <PageHeader title="Downloads">Installer downloads served from Supabase Storage.</PageHeader>
      <Suspense fallback={<Loading />}>
        <Downloads searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Downloads({ searchParams }: Pick<PageProps<"/admin/downloads">, "searchParams">) {
  const { f, bar } = await adminFilters(searchParams, ["country"]);
  const r = await loadDownloads(f);
  if (!r.ok) return <div className="space-y-6">{bar}<ErrorNote message={r.error} /></div>;
  const d = r.data;
  return (
    <div className="space-y-6">
      {bar}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <Kpi label="Downloads" value={d.total} />
        <Kpi label="Countries" value={d.countries.filter((c) => c.label !== "unknown").length} />
        <Kpi label="Versions" value={d.releases.length} />
      </div>
      <Panel title="Downloads per day">
        <TrendChart data={d.daily} series={[{ key: "downloads", label: "Downloads", color: "var(--ember)" }]} />
      </Panel>
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="By country">
          <RankChart data={d.countries} label="Downloads" />
        </Panel>
        <Panel title="By version">
          <RankChart data={d.releases} label="Downloads" color="var(--amber)" />
        </Panel>
      </div>
    </div>
  );
}
