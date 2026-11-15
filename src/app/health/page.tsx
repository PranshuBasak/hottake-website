import type { Metadata } from "next";
import { HealthStatus } from "@/components/site/health-status";

export const metadata: Metadata = {
  title: "System status",
  description: "Live status of the HotTake website: database, storage, the installer download and configuration.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/health" },
};

export default function HealthPage() {
  return (
    <section className="container-site max-w-3xl pt-32 pb-24">
      <p className="eyebrow mb-3">System status</p>
      <h1 className="text-4xl font-extrabold sm:text-5xl">Is HotTake&apos;s website healthy?</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        A live check of everything the site depends on. Each visit runs the checks again. Machines can read the same result as JSON
        at <a href="/api/health" className="font-mono text-amber underline underline-offset-4">/api/health</a>.
      </p>
      <HealthStatus />
    </section>
  );
}
