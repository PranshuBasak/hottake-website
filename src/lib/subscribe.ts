import { z } from "zod";

export type SubscribeResult = { ok: true; email: string } | { ok: false; error: string };
export type SubscribeStatus = "subscribed" | "already" | "resubscribed" | "rate_limited" | "error";

const email = z.string().trim().toLowerCase().max(254).pipe(z.email());

/** Pure validation for the sign-up form. `company` is a hidden honeypot field. */
export function validateSubscribe(input: { email?: unknown; company?: unknown }): SubscribeResult {
  if (typeof input.company === "string" && input.company.trim() !== "") return { ok: false, error: "bot" };
  const parsed = email.safeParse(typeof input.email === "string" ? input.email : "");
  if (!parsed.success) return { ok: false, error: "That doesn't look like an email address." };
  return { ok: true, email: parsed.data };
}

export function subscribeMessage(status: SubscribeStatus): string {
  switch (status) {
    case "subscribed":
      return "You're in. We'll email you when there's something worth playing.";
    case "resubscribed":
      return "Welcome back. You're subscribed again.";
    case "already":
      return "You're already on the list. Nothing more to do.";
    case "rate_limited":
      return "Too many sign-ups from your network just now. Try again in an hour.";
    default:
      return "Something went wrong on our side. Please try again in a minute.";
  }
}
