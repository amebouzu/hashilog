/**
 * Stripe Webhook エンドポイント (スタブ)
 *
 * 環境変数:
 *   STRIPE_SECRET_KEY
 *   STRIPE_WEBHOOK_SECRET
 *
 * 実装ポイント:
 * - Stripe からの POST を署名検証 (constructEvent) でフィルタ
 * - イベントごとに subscriptions テーブルを更新
 * - 主要イベント:
 *     checkout.session.completed       → サブスクリプション開始
 *     customer.subscription.updated    → ステータス・期間更新
 *     customer.subscription.deleted    → 解約
 *     invoice.payment_failed           → past_due
 *
 * このスタブは「Stripe 未設定なら 200 OK で握りつぶす」だけ。
 * 後から Stripe SDK を追加して configure すれば webhook 経由で
 * subscriptions テーブルが自動更新される。
 */

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeKey || !webhookSecret) {
    // 設定前は 200 を返してリトライをさせない (Stripe 側で signal both)
    return NextResponse.json(
      { received: true, configured: false },
      { status: 200 }
    );
  }

  // === 実装スケッチ ===
  // import Stripe from "stripe";
  // import { createClient } from "@supabase/supabase-js";
  //
  // const stripe = new Stripe(stripeKey, { apiVersion: "2024-06-20" });
  // const sig = req.headers.get("stripe-signature");
  // const buf = await req.arrayBuffer();
  // let event: Stripe.Event;
  // try {
  //   event = stripe.webhooks.constructEvent(
  //     Buffer.from(buf),
  //     sig!,
  //     webhookSecret
  //   );
  // } catch (err) {
  //   return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  // }
  //
  // // service_role でアクセス (RLS バイパス)
  // const admin = createClient(
  //   process.env.NEXT_PUBLIC_SUPABASE_URL!,
  //   process.env.SUPABASE_SERVICE_ROLE_KEY!
  // );
  //
  // switch (event.type) {
  //   case "checkout.session.completed": {
  //     const s = event.data.object as Stripe.Checkout.Session;
  //     const userId = s.client_reference_id;
  //     await admin.from("subscriptions").update({
  //       tier: tierFromPriceId(s),  // priceId -> tier 解決
  //       status: "active",
  //       provider: "stripe",
  //       provider_customer_id: s.customer as string,
  //       provider_subscription_id: s.subscription as string
  //     }).eq("user_id", userId!);
  //     break;
  //   }
  //   case "customer.subscription.updated": { /* ... */ break; }
  //   case "customer.subscription.deleted": { /* ... */ break; }
  //   case "invoice.payment_failed":       { /* ... */ break; }
  // }

  return NextResponse.json({ received: true, configured: true });
}
