import type { Metadata } from "next";
import { Suspense } from "react";
import { RankChart, ShareChart } from "@/components/admin/charts";
import { adminFilters } from "@/components/admin/page-filters";
import { ErrorNote, Kpi, Loading, PageHeader, Panel } from "@/components/admin/ui";
import { loadAudience } from "@/lib/admin-data";

export const metadata: Metadata = { title: "Audience" };

export default function AudiencePage({ searchParams }: PageProps<"/admin/audience">) {
  return (
    <>
      <PageHeader title="Audience">
        Where visitors come from and what they use. Only sessions from people who accepted analytics cookies are recorded here.
      </PageHeader>
      <Suspense fallback={<Loading />}>
        <Audience searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Audience({ searchParams }: Pick<PageProps<"/admin/audience">, "searchParams">) {
  const { f, bar } = await adminFilters(searchParams, ["country", "device", "path"]);
  const r = await loadAudience(f);
  if (!r.ok) return <div className="space-y-6">{bar}<ErrorNote message={r.error} /></div>;
  const a = r.data;
  return (
    <div className="space-y-6">
      {bar}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <Kpi label="Sessions" value={a.sessions} />
        <Kpi label="New visitors" value={a.new_vs_returning.new} />
        <Kpi label="Returning visitors" value={a.new_vs_returning.returning} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Countries">
          <RankChart data={a.countries} label="Sessions" />
        </Panel>
        <Panel title="Referrers" note="The site people came from; direct means no referrer.">
          <RankChart data={a.referrers} label="Sessions" color="var(--amber)" />
        </Panel>
        <Panel title="Browsers">
          <ShareChart data={a.browsers} />
        </Panel>
        <Panel title="Operating systems">
          <ShareChart data={a.os} />
        </Panel>
        <Panel title="Campaigns" note="utm_source on the landing URL." className="lg:col-span-2">
          <RankChart data={a.utm} label="Sessions" color="var(--ok)" />
        </Panel>
      </div>
    </div>
  );
}
