import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getAdmin } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Unsubscribe", robots: { index: false, follow: false } };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function UnsubscribePage({ searchParams }: PageProps<"/unsubscribe">) {
  return (
    <Suspense fallback={<section className="min-h-[70vh]" />}>
      <Unsubscribe searchParams={searchParams} />
    </Suspense>
  );
}

async function Unsubscribe({ searchParams }: { searchParams: PageProps<"/unsubscribe">["searchParams"] }) {
  const { token } = await searchParams;
  let ok = false;
  if (typeof token === "string" && UUID.test(token)) {
    const admin = getAdmin();
    if (admin) {
      const { data } = await admin.rpc("unsubscribe", { p_token: token });
      ok = data === true;
    }
  }
  return (
    <section className="container-site grid min-h-[70vh] place-items-center pt-28 text-center">
      <div className="max-w-md">
        <h1 className="text-4xl font-extrabold">{ok ? "You're unsubscribed." : "That link didn't work."}</h1>
        <p className="mt-4 text-muted-foreground">
          {ok
            ? "You won't get any more HotTake emails. Changed your mind? You can sign up again on the home page."
            : "The unsubscribe link is invalid or has expired. Email us and we'll remove you by hand."}
        </p>
        <Link href="/" className="mt-8 inline-flex h-11 items-center rounded-full bg-secondary px-6 font-semibold hover:bg-bg-3">
          Back to HotTake
        </Link>
      </div>
    </section>
  );
}
