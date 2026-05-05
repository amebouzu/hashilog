/**
 * プラン上限チェック (Server Component / Server Action 専用)
 *
 * - feature_flags.limits_enforced が false の間は常に許可 (お試し運用期間)
 * - true になると DB の plan_limits に従ってブロックする
 *
 * 使用例:
 *   const check = await canAddCar(userId);
 *   if (!check.allowed) throw new Error(check.reason);
 */

import { createClient } from "@/lib/supabase/server";
import { DEFAULT_PLANS, type PlanLimit, type PlanTier } from "@/lib/plans";
import { isFlagEnabled } from "@/lib/feature-flags";

export type LimitCheck = {
  allowed: boolean;
  reason?: string;
  current?: number;
  max?: number | null;
  tier: PlanTier;
};

async function fetchPlan(userId: string): Promise<PlanLimit> {
  const supabase = createClient();
  const { data } = await supabase
    .from("subscriptions")
    .select(
      "tier, status, plan_limits!inner(tier, max_cars, max_lap_photos, max_laps_per_month, max_video_seconds, features, display_name, description, monthly_price_jpy, yearly_price_jpy)"
    )
    .eq("user_id", userId)
    .in("status", ["active", "trialing"])
    .maybeSingle();

  const pl = (data as any)?.plan_limits;
  if (pl) {
    return {
      ...pl,
      features: Array.isArray(pl.features)
        ? pl.features
        : JSON.parse(pl.features ?? "[]")
    } as PlanLimit;
  }
  return DEFAULT_PLANS.free;
}

export async function getUserPlan(userId: string): Promise<PlanLimit> {
  return fetchPlan(userId);
}

export async function canAddCar(userId: string): Promise<LimitCheck> {
  const plan = await fetchPlan(userId);
  const enforced = await isFlagEnabled("limits_enforced");
  if (!enforced || plan.max_cars == null) {
    return { allowed: true, tier: plan.tier, max: plan.max_cars };
  }
  const supabase = createClient();
  const { count } = await supabase
    .from("cars")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);
  const current = count ?? 0;
  if (current >= plan.max_cars) {
    return {
      allowed: false,
      reason: `${plan.display_name}プランでは愛車は ${plan.max_cars} 台までです。アップグレードで無制限になります。`,
      current,
      max: plan.max_cars,
      tier: plan.tier
    };
  }
  return { allowed: true, current, max: plan.max_cars, tier: plan.tier };
}

export async function canPostLap(userId: string): Promise<LimitCheck> {
  const plan = await fetchPlan(userId);
  const enforced = await isFlagEnabled("limits_enforced");
  if (!enforced || plan.max_laps_per_month == null) {
    return { allowed: true, tier: plan.tier, max: plan.max_laps_per_month };
  }
  const period = new Date().toISOString().slice(0, 7); // YYYY-MM
  const supabase = createClient();
  const { data } = await supabase
    .from("usage_counters")
    .select("laps_posted")
    .eq("user_id", userId)
    .eq("period", period)
    .maybeSingle();
  const current = data?.laps_posted ?? 0;
  if (current >= plan.max_laps_per_month) {
    return {
      allowed: false,
      reason: `${plan.display_name}プランでは月 ${plan.max_laps_per_month} 本までです。Premium にアップグレードで無制限投稿できます。`,
      current,
      max: plan.max_laps_per_month,
      tier: plan.tier
    };
  }
  return {
    allowed: true,
    current,
    max: plan.max_laps_per_month,
    tier: plan.tier
  };
}

export async function canUploadPhotos(
  userId: string,
  count: number
): Promise<LimitCheck> {
  const plan = await fetchPlan(userId);
  const enforced = await isFlagEnabled("limits_enforced");
  if (!enforced || plan.max_lap_photos == null) {
    return { allowed: true, tier: plan.tier, max: plan.max_lap_photos };
  }
  if (count > plan.max_lap_photos) {
    return {
      allowed: false,
      reason: `1ラップあたり最大 ${plan.max_lap_photos} 枚までです (${plan.display_name}プラン)。`,
      current: count,
      max: plan.max_lap_photos,
      tier: plan.tier
    };
  }
  return { allowed: true, current: count, max: plan.max_lap_photos, tier: plan.tier };
}

export async function canUploadVideo(
  userId: string,
  durationSec: number
): Promise<LimitCheck> {
  const plan = await fetchPlan(userId);
  const enforced = await isFlagEnabled("limits_enforced");
  const max = plan.max_video_seconds ?? 0;
  if (!enforced) return { allowed: true, tier: plan.tier, max };
  if (max === 0) {
    return {
      allowed: false,
      reason: `動画アップロードは Premium 以上で利用できます。`,
      tier: plan.tier,
      max: 0
    };
  }
  if (durationSec > max) {
    return {
      allowed: false,
      reason: `動画は ${Math.floor(max / 60)} 分までです (${plan.display_name}プラン)。`,
      current: durationSec,
      max,
      tier: plan.tier
    };
  }
  return { allowed: true, current: durationSec, max, tier: plan.tier };
}
