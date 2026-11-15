"use client";

import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <section className="grid min-h-[80vh] place-items-center px-4 pt-24 text-center">
      <div className="max-w-md">
        <p className="eyebrow">Something broke</p>
        <h1 className="mt-3 text-5xl font-extrabold">The host dropped the controller.</h1>
        <p className="mt-4 text-muted-foreground">An unexpected error stopped this page. Try again, and if it keeps happening, let us know.</p>
        <button type="button" onClick={reset} className="mt-8 inline-flex h-12 items-center rounded-full bg-ember px-6 font-semibold text-[#1a120d] hover:bg-amber">
          Try again
        </button>
      </div>
    </section>
  );
}
