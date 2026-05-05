/**
 * フィーチャーフラグ取得 (Server Component 専用)
 * - DB の feature_flags テーブルから現在のスイッチ状態を取得
 * - すべての機能はデフォルト OFF。運営側で個別に ON にする想定。
 *
 * 使用例:
 *   const flags = await getFeatureFlags();
 *   if (flags.ads_enabled) <AdSlot slotKey="ranking_top" />
 */

import { createClient } from "@/lib/supabase/server";

export type FlagKey =
  | "billing_enabled"
  | "ads_enabled"
  | "affiliate_enabled"
  | "marketplace_enabled"
  | "circuit_partner_enabled"
  | "premium_features_visible"
  | "limits_enforced"
  | "annual_report_enabled"
  | "coaching_enabled";

export type FeatureFlags = Record<FlagKey, boolean>;

export const DEFAULT_FLAGS: FeatureFlags = {
  billing_enabled: false,
  ads_enabled: false,
  affiliate_enabled: false,
  marketplace_enabled: false,
  circuit_partner_enabled: false,
  premium_features_visible: false,
  limits_enforced: false,
  annual_report_enabled: false,
  coaching_enabled: false
};

let cache: { flags: FeatureFlags; expires: number } | null = null;
const CACHE_TTL_MS = 30_000; // 30秒キャッシュ (本番は revalidate path 等で短縮可)

export async function getFeatureFlags(): Promise<FeatureFlags> {
  if (cache && cache.expires > Date.now()) return cache.flags;

  const supabase = createClient();
  const { data } = await supabase
    .from("feature_flags")
    .select("key, enabled");

  const flags = { ...DEFAULT_FLAGS };
  for (const row of data ?? []) {
    if (row.key in flags) {
      (flags as any)[row.key] = !!row.enabled;
    }
  }
  cache = { flags, expires: Date.now() + CACHE_TTL_MS };
  return flags;
}

export async function isFlagEnabled(key: FlagKey): Promise<boolean> {
  const flags = await getFeatureFlags();
  return flags[key];
}

export function clearFlagCache() {
  cache = null;
}
