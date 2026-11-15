"use client";

import { useActionState, useState } from "react";
import { toast } from "sonner";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { subscribeAction, type SubscribeState } from "@/app/actions/subscribe";
import { useInlineValidation } from "@/components/interior/inline-validation";
import { validateSubscribe } from "@/lib/subscribe";
import { cn } from "@/lib/utils";
import { track } from "./tracker";

const initial: SubscribeState = { status: "idle", message: "" };

export function SubscribeForm({ source = "site", className }: { source?: string; className?: string }) {
  const [email, setEmail] = useState("");
  const [state, formAction, pending] = useActionState(async (prev: SubscribeState, form: FormData) => {
    const next = await subscribeAction(prev, form);
    if (next.status === "subscribed" || next.status === "already" || next.status === "resubscribed") {
      toast.success(next.message);
      if (next.status !== "already") track("subscribe", { source });
      setEmail("");
    } else toast.error(next.message);
    return next;
  }, initial);
  const v = useInlineValidation({
    value: email,
    validate: (value) => (value === "" ? null : (() => {
      const r = validateSubscribe({ email: value });
      return r.ok ? null : r.error;
    })()),
    debounce: 500,
  });

  const done = state.status === "subscribed" || state.status === "resubscribed";

  return (
    <form action={formAction} className={cn("w-full max-w-md", className)} noValidate>
      <input type="hidden" name="source" value={source} />
      {/* honeypot: hidden from people, irresistible to bots */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Company <input type="text" name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <label htmlFor={`email-${source}`} className="sr-only">
        Email address
      </label>
      <div
        className={cn(
          "group flex items-center gap-1 rounded-full border bg-bg-1/80 p-1.5 pl-5 backdrop-blur transition-colors focus-within:border-amber",
          v.status === "invalid" ? "border-destructive" : "border-border",
        )}
      >
        <input
          id={`email-${source}`}
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={v.commit}
          aria-invalid={v.status === "invalid"}
          aria-describedby={`email-${source}-msg`}
          className="min-w-0 flex-1 bg-transparent py-2 text-base outline-none placeholder:text-muted-foreground/60"
        />
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-ember px-5 text-sm font-semibold text-[#1a120d] transition-[transform,background] hover:bg-amber active:scale-[0.97] disabled:opacity-70"
        >
          {pending ? <Loader2 className="size-4 animate-spin" /> : done ? <Check className="size-4" /> : null}
          {pending ? "Joining" : done ? "Subscribed" : "Notify me"}
          {!pending && !done && <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />}
        </button>
      </div>
      <p id={`email-${source}-msg`} aria-live="polite" className="mt-2 min-h-5 px-5 text-sm text-destructive">
        {v.status === "invalid" ? v.error : ""}
      </p>
      <p className="px-5 text-xs text-muted-foreground">
        Release news only. Unsubscribe with one click. See the{" "}
        <a href="/privacy" className="underline underline-offset-4 hover:text-foreground">
          privacy policy
        </a>
        .
      </p>
    </form>
  );
}
