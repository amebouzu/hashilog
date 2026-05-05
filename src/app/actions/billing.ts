"use server";

/**
 * 課金関連の Server Actions (スタブ)
 *
 * - 実装は Stripe SDK を後から差し込む構造にしている
 * - 環境変数 STRIPE_SECRET_KEY が未設定の間は no-op で安全に動作
 *
 * 必要な環境変数 (本番投入時):
 *   STRIPE_SECRET_KEY=sk_live_...
 *   STRIPE_WEBHOOK_SECRET=whsec_...
 *   STRIPE_PRICE_PREMIUM_MONTHLY=price_...
 *   STRIPE_PRICE_PREMIUM_YEARLY=price_...
 *   STRIPE_PRICE_PRO_MONTHLY=price_...
 *   STRIPE_PRICE_PRO_YEARLY=price_...
 *   NEXT_PUBLIC_SITE_URL=https://hashirolog.example
 */

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isFlagEnabled } from "@/lib/feature-flags";
import type { PlanTier } from "@/lib/plans";

type Cycle = "monthly" | "yearly";

function getStripePriceId(tier: PlanTier, cycle: Cycle): string | null {
  if (tier === "free") return null;
  const env = process.env;
  if (tier === "premium" && cycle === "monthly")
    return env.STRIPE_PRICE_PREMIUM_MONTHLY ?? null;
  if (tier === "premium" && cycle === "yearly")
    return env.STRIPE_PRICE_PREMIUM_YEARLY ?? null;
  if (tier === "pro" && cycle === "monthly")
    return env.STRIPE_PRICE_PRO_MONTHLY ?? null;
  if (tier === "pro" && cycle === "yearly")
    return env.STRIPE_PRICE_PRO_YEARLY ?? null;
  return null;
}

/**
 * Stripe Checkout セッションを作成して URL にリダイレクト。
 * 課金が無効化されているか Stripe 未設定の間は /billing へ戻す。
 */
export async function startCheckout(formData: FormData) {
  const tier = (formData.get("tier") ?? "premium") as PlanTier;
  const cycle = (formData.get("cycle") ?? "monthly") as Cycle;

  const enabled = await isFlagEnabled("billing_enabled");
  if (!enabled) {
    redirect("/billing?status=disabled");
  }

  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const priceId = getStripePriceId(tier, cycle);
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey || !priceId) {
    redirect("/billing?status=not_configured");
  }

  // === Stripe SDK 呼び出しは未配線 ===
  // 実装する際:
  //   import Stripe from "stripe";
  //   const stripe = new Stripe(stripeKey, { apiVersion: "2024-06-20" });
  //   const session = await stripe.checkout.sessions.create({
  //     mode: "subscription",
  //     customer_email: user.email,
  //     client_reference_id: user.id,
  //     line_items: [{ price: priceId, quantity: 1 }],
  //     success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/billing?status=success`,
  //     cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/billing?status=cancel`
  //   });
  //   redirect(session.url!);

  redirect("/billing?status=pending");
}

/**
 * Stripe Customer Portal を開く (解約・支払い方法変更用)
 */
export async function openCustomerPortal() {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("provider_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey || !sub?.provider_customer_id) {
    redirect("/billing?status=not_configured");
  }

  // 実装する際:
  //   const stripe = new Stripe(stripeKey, { apiVersion: "2024-06-20" });
  //   const portal = await stripe.billingPortal.sessions.create({
  //     customer: sub.provider_customer_id,
  //     return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/billing`
  //   });
  //   redirect(portal.url);

  redirect("/billing");
}

/**
 * 運営側からの手動アップグレード (テスト・キャンペーン・補償用途)
 * service_role キー or 運営権限を持ったユーザーから呼び出す想定。
 */
export async function adminSetPlan(
  userId: string,
  tier: PlanTier,
  notes?: string
) {
  const supabase = createClient();
  const { error } = await supabase
    .from("subscriptions")
    .update({
      tier,
      status: "active",
      provider: "manual",
      notes: notes ?? `manually set to ${tier} at ${new Date().toISOString()}`
    })
    .eq("user_id", userId);
  if (error) throw error;
  revalidatePath("/admin");
  revalidatePath("/billing");
}
