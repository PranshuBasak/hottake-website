"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";

const shortDay = (v: string) => new Date(v).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });

/** Daily series. Each `series.key` must exist on every row. */
export function TrendChart({ data, series }: { data: Record<string, string | number>[]; series: { key: string; label: string; color: string }[] }) {
  const config: ChartConfig = Object.fromEntries(series.map((s) => [s.key, { label: s.label, color: s.color }]));
  return (
    <ChartContainer config={config} className="aspect-auto h-64 w-full">
      <AreaChart data={data} margin={{ left: 0, right: 8, top: 8 }}>
        <defs>
          {series.map((s) => (
            <linearGradient key={s.key} id={`fill-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={`var(--color-${s.key})`} stopOpacity={0.5} />
              <stop offset="95%" stopColor={`var(--color-${s.key})`} stopOpacity={0.02} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid vertical={false} strokeOpacity={0.15} />
        <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} minTickGap={24} tickFormatter={shortDay} />
        <YAxis tickLine={false} axisLine={false} width={36} allowDecimals={false} />
        <ChartTooltip content={<ChartTooltipContent labelFormatter={(v) => shortDay(String(v))} indicator="line" />} />
        {series.map((s) => (
          <Area key={s.key} dataKey={s.key} type="monotone" stroke={`var(--color-${s.key})`} fill={`url(#fill-${s.key})`} strokeWidth={2} />
        ))}
        {series.length > 1 && <ChartLegend content={<ChartLegendContent />} />}
      </AreaChart>
    </ChartContainer>
  );
}

/** Horizontal ranked bars for "top N" lists. */
export function RankChart({ data, label, color = "var(--ember)" }: { data: { label: string; value: number }[]; label: string; color?: string }) {
  if (!data.length) return <Empty />;
  const config: ChartConfig = { value: { label, color } };
  return (
    <ChartContainer config={config} className="aspect-auto w-full" style={{ height: Math.max(120, data.length * 34) }}>
      <BarChart data={data} layout="vertical" margin={{ left: 0, right: 16 }}>
        <XAxis type="number" hide allowDecimals={false} />
        <YAxis type="category" dataKey="label" tickLine={false} axisLine={false} width={140} tick={{ fontSize: 12 }} />
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
        <Bar dataKey="value" fill="var(--color-value)" radius={6} />
      </BarChart>
    </ChartContainer>
  );
}

const PIE_COLORS = ["var(--ember)", "var(--amber)", "var(--ok)", "#8ab4ff", "#c79bff", "#ff8fa3"];

export function ShareChart({ data }: { data: { label: string; value: number }[] }) {
  if (!data.length || data.every((d) => !d.value)) return <Empty />;
  const config: ChartConfig = Object.fromEntries(data.map((d, i) => [d.label, { label: d.label, color: PIE_COLORS[i % PIE_COLORS.length] }]));
  return (
    <ChartContainer config={config} className="mx-auto aspect-square h-64">
      <PieChart>
        <ChartTooltip content={<ChartTooltipContent nameKey="label" hideLabel />} />
        <Pie data={data} dataKey="value" nameKey="label" innerRadius={52} strokeWidth={2} stroke="var(--bg-1)">
          {data.map((d, i) => (
            <Cell key={d.label} fill={PIE_COLORS[i % PIE_COLORS.length]} />
          ))}
        </Pie>
        <ChartLegend content={<ChartLegendContent nameKey="label" />} className="flex-wrap" />
      </PieChart>
    </ChartContainer>
  );
}

/** Thumbs up vs down per game, stacked. */
export function VotesChart({ data }: { data: { name: string; up: number; down: number }[] }) {
  if (!data.length) return <Empty />;
  const config: ChartConfig = { up: { label: "Thumbs up", color: "var(--ok)" }, down: { label: "Thumbs down", color: "var(--destructive)" } };
  return (
    <ChartContainer config={config} className="aspect-auto w-full" style={{ height: Math.max(140, data.length * 30 + 40) }}>
      <BarChart data={data} layout="vertical" margin={{ left: 0, right: 16 }}>
        <XAxis type="number" hide allowDecimals={false} />
        <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} width={150} tick={{ fontSize: 12 }} />
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="up" stackId="v" fill="var(--color-up)" />
        <Bar dataKey="down" stackId="v" fill="var(--color-down)" radius={[0, 6, 6, 0]} />
      </BarChart>
    </ChartContainer>
  );
}

function Empty() {
  return <p className="grid h-32 place-items-center text-sm text-muted-foreground">No data for these filters.</p>;
}
