import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getFeatureFlags } from "@/lib/feature-flags";
import { getUserPlan } from "@/lib/limits";
import {
  DEFAULT_PLANS,
  FEATURE_LABEL,
  type PlanLimit,
  type PlanTier
} from "@/lib/plans";
import { startCheckout, openCustomerPortal } from "@/app/actions/billing";

export const dynamic = "force-dynamic";

export default async function BillingPage({
  searchParams
}: {
  searchParams: { status?: string };
}) {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const flags = await getFeatureFlags();
  const currentPlan = await getUserPlan(user.id);

  // DB から最新のプラン定義を取得 (なければ DEFAULT_PLANS にフォールバック)
  const { data: planRows } = await supabase
    .from("plan_limits")
    .select("*")
    .order("monthly_price_jpy");
  const plans: Record<PlanTier, PlanLimit> = { ...DEFAULT_PLANS };
  for (const row of planRows ?? []) {
    plans[row.tier as PlanTier] = {
      ...row,
      features: Array.isArray(row.features)
        ? row.features
        : JSON.parse(row.features ?? "[]")
    } as PlanLimit;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">プランと料金</h1>
        <p className="mt-1 text-sm text-zinc-600">
          現在のプラン:{" "}
          <span className="font-bold text-zinc-900">
            {currentPlan.display_name}
          </span>
        </p>
      </div>

      {searchParams.status === "disabled" && (
        <Notice type="info">
          現在は試験運用期間のため、有料プランの申込は受け付けていません。
        </Notice>
      )}
      {searchParams.status === "not_configured" && (
        <Notice type="warn">
          決済システムの準備中です。準備完了次第、こちらでお知らせします。
        </Notice>
      )}
      {searchParams.status === "success" && (
        <Notice type="success">プランが切り替わりました。</Notice>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        {(["free", "premium", "pro"] as PlanTier[]).map((t) => (
          <PlanCard
            key={t}
            plan={plans[t]}
            current={currentPlan.tier === t}
            billingEnabled={flags.billing_enabled}
          />
        ))}
      </div>

      {currentPlan.tier !== "free" && (
        <div className="rounded-lg border border-zinc-200 bg-white p-5">
          <h2 className="mb-2 text-lg font-bold text-zinc-900">
            プラン管理
          </h2>
          <p className="mb-3 text-sm text-zinc-600">
            支払い方法の変更・解約は以下からお進みください。
          </p>
          <form action={openCustomerPortal}>
            <button
              type="submit"
              className="rounded border border-zinc-300 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
            >
              支払い情報を管理
            </button>
          </form>
        </div>
      )}

      <p className="text-xs text-zinc-500">
        ※ 価格はすべて税込。プラン仕様は予告なく変更されることがあります。
      </p>
    </div>
  );
}

function PlanCard({
  plan,
  current,
  billingEnabled
}: {
  plan: PlanLimit;
  current: boolean;
  billingEnabled: boolean;
}) {
  const cardCls =
    plan.tier === "premium"
      ? "border-amber-300 ring-1 ring-amber-300"
      : plan.tier === "pro"
        ? "border-purple-300 ring-1 ring-purple-300"
        : "border-zinc-200";
  return (
    <div className={`flex flex-col rounded-xl border bg-white p-5 ${cardCls}`}>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-lg font-bold text-zinc-900">
          {plan.display_name}
        </h3>
        {current && (
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-600">
            現在のプラン
          </span>
        )}
      </div>
      <p className="mb-4 text-xs text-zinc-500">{plan.description}</p>
      <div className="mb-4">
        {plan.monthly_price_jpy === 0 ? (
          <p className="text-3xl font-extrabold text-zinc-900">¥0</p>
        ) : (
          <>
            <p className="text-3xl font-extrabold text-zinc-900">
              ¥{plan.monthly_price_jpy.toLocaleString()}
              <span className="text-sm font-normal text-zinc-500">/月</span>
            </p>
            <p className="text-xs text-zinc-500">
              年額¥{plan.yearly_price_jpy.toLocaleString()} (1ヶ月分お得)
            </p>
          </>
        )}
      </div>
      <ul className="mb-5 space-y-1 text-sm text-zinc-700">
        {plan.max_cars != null && (
          <Bullet>愛車登録 {plan.max_cars} 台まで</Bullet>
        )}
        {plan.max_cars == null && <Bullet strong>愛車登録 無制限</Bullet>}
        {plan.max_laps_per_month != null ? (
          <Bullet>月{plan.max_laps_per_month}本までラップ投稿</Bullet>
        ) : (
          <Bullet strong>ラップ投稿 無制限</Bullet>
        )}
        {plan.max_lap_photos != null && (
          <Bullet>1ラップあたり写真{plan.max_lap_photos}枚まで</Bullet>
        )}
        {plan.features.slice(0, 8).map((f) => {
          if (f === "basic_ranking" || f === "basic_share") return null;
          return <Bullet key={f}>{FEATURE_LABEL[f] ?? f}</Bullet>;
        })}
      </ul>
      {plan.tier !== "free" && (
        <form action={startCheckout} className="mt-auto space-y-2">
          <input type="hidden" name="tier" value={plan.tier} />
          <input type="hidden" name="cycle" value="monthly" />
          <button
            type="submit"
            disabled={current || !billingEnabled}
            className="w-full rounded bg-racing-red px-4 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
          >
            {current
              ? "ご利用中"
              : !billingEnabled
                ? "近日提供開始"
                : `${plan.display_name} に変更`}
          </button>
        </form>
      )}
      {plan.tier === "free" && current && (
        <button
          disabled
          className="mt-auto w-full rounded border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-500"
        >
          現在ご利用中
        </button>
      )}
    </div>
  );
}

function Bullet({
  children,
  strong
}: {
  children: React.ReactNode;
  strong?: boolean;
}) {
  return (
    <li className="flex items-start gap-2">
      <span className="mt-0.5 text-racing-red">✓</span>
      <span className={strong ? "font-bold" : ""}>{children}</span>
    </li>
  );
}

function Notice({
  type,
  children
}: {
  type: "info" | "warn" | "success";
  children: React.ReactNode;
}) {
  const cls =
    type === "success"
      ? "border-emerald-300 bg-emerald-50 text-emerald-900"
      : type === "warn"
        ? "border-amber-300 bg-amber-50 text-amber-900"
        : "border-zinc-300 bg-zinc-50 text-zinc-800";
  return (
    <div className={`rounded-lg border p-3 text-sm ${cls}`}>{children}</div>
  );
}
