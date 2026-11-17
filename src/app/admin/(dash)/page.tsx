import type { Metadata } from "next";
import { Suspense } from "react";
import { RankChart, ShareChart, TrendChart } from "@/components/admin/charts";
import { adminFilters } from "@/components/admin/page-filters";
import { ErrorNote, Kpi, Loading, PageHeader, Panel } from "@/components/admin/ui";
import { loadOverview } from "@/lib/admin-data";

export const metadata: Metadata = { title: "Overview" };

export default function OverviewPage({ searchParams }: PageProps<"/admin">) {
  return (
    <>
      <PageHeader title="Overview">Traffic, downloads, sign-ups and feedback at a glance.</PageHeader>
      <Suspense fallback={<Loading />}>
        <Overview searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Overview({ searchParams }: Pick<PageProps<"/admin">, "searchParams">) {
  const { f, bar } = await adminFilters(searchParams, ["country", "device", "path"]);
  const r = await loadOverview(f);
  if (!r.ok) return <div className="space-y-6">{bar}<ErrorNote message={r.error} /></div>;
  const { kpis, previous, daily, top_pages, devices } = r.data;
  return (
    <div className="space-y-6">
      {bar}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        <Kpi label="Page views" value={kpis.page_views} previous={previous.page_views} />
        <Kpi label="Visitors" value={kpis.visitors} previous={previous.visitors} />
        <Kpi label="Downloads" value={kpis.downloads} previous={previous.downloads} />
        <Kpi label="Sign-ups" value={kpis.signups} previous={previous.signups} />
        <Kpi label="Votes" value={kpis.votes} previous={previous.votes} />
        <Kpi label="Comments" value={kpis.comments} previous={previous.comments} />
      </div>
      <Panel title="Traffic per day" note="Visitors are counted per browser per day.">
        <TrendChart
          data={daily}
          series={[
            { key: "page_views", label: "Page views", color: "var(--ember)" },
            { key: "visitors", label: "Visitors", color: "var(--amber)" },
          ]}
        />
      </Panel>
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Panel title="Top pages">
          <RankChart data={top_pages.map((p) => ({ label: p.path, value: p.views }))} label="Views" />
        </Panel>
        <Panel title="Devices" note="Only known for visitors who accepted analytics cookies.">
          <ShareChart data={devices.map((d) => ({ label: d.device, value: d.views }))} />
        </Panel>
      </div>
    </div>
  );
}
