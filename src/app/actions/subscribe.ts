"use server";

import { headers } from "next/headers";
import { getAdmin } from "@/lib/supabase/admin";
import { subscribeMessage, validateSubscribe, type SubscribeStatus } from "@/lib/subscribe";
import { clientIp } from "@/lib/track";

export type SubscribeState = { status: SubscribeStatus | "invalid" | "idle"; message: string };

export async function subscribeAction(_prev: SubscribeState, form: FormData): Promise<SubscribeState> {
  const v = validateSubscribe({ email: form.get("email"), company: form.get("company") });
  if (!v.ok) {
    // Bots get a fake success so they learn nothing.
    if (v.error === "bot") return { status: "subscribed", message: subscribeMessage("subscribed") };
    return { status: "invalid", message: v.error };
  }

  const admin = getAdmin();
  if (!admin) return { status: "error", message: subscribeMessage("error") };

  const h = await headers();
  const source = String(form.get("source") ?? "site").slice(0, 40);
  const { data, error } = await admin.rpc("subscribe", {
    p_email: v.email,
    p_source: source,
    p_ip: clientIp(h.get("x-forwarded-for"), h.get("x-real-ip")),
  });
  if (error) {
    console.error("subscribe failed:", error.message);
    return { status: "error", message: subscribeMessage("error") };
  }
  const status = (data as SubscribeStatus) ?? "error";
  return { status, message: subscribeMessage(status) };
}
