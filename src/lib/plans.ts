/**
 * プラン定義とフィーチャーキー一覧 (定数。DB の plan_limits と同期させる)
 *
 * - 機能の追加: FeatureKey に追加し、各プランの features 配列に含めるかを設定
 * - 価格変更: DB の plan_limits を更新 (定数の方は表示用)
 */

export type PlanTier = "free" | "premium" | "pro";

export type SubscriptionStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "cancelled"
  | "expired";

export type Subscription = {
  id: string;
  user_id: string;
  tier: PlanTier;
  status: SubscriptionStatus;
  current_period_start: string | null;
  current_period_end: string | null;
  trial_ends_at: string | null;
  cancelled_at: string | null;
  provider: string | null;
  provider_customer_id: string | null;
  provider_subscription_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type PlanLimit = {
  tier: PlanTier;
  max_cars: number | null;
  max_lap_photos: number | null;
  max_laps_per_month: number | null;
  max_video_seconds: number | null;
  features: FeatureKey[];
  display_name: string;
  description: string | null;
  monthly_price_jpy: number;
  yearly_price_jpy: number;
};

/**
 * 全フィーチャー識別子。
 * UI 上で `hasFeature(plan, "premium_badge")` のように使用。
 * これらのキーは DB plan_limits.features 配列にも記録される。
 */
export const FEATURE_KEYS = [
  "basic_ranking",
  "basic_share",
  "no_ads",
  "detailed_analytics",
  "rival_compare",
  "condition_correlation",
  "video_upload",
  "csv_export",
  "record_alerts",
  "private_mode",
  "page_themes",
  "premium_badge",
  // Pro
  "telemetry_import",
  "ai_analysis",
  "coaching",
  "team_features",
  "api_access"
] as const;

export type FeatureKey = (typeof FEATURE_KEYS)[number];

export const FEATURE_LABEL: Record<FeatureKey, string> = {
  basic_ranking: "基本ランキング",
  basic_share: "SNSシェア",
  no_ads: "広告非表示",
  detailed_analytics: "詳細分析グラフ",
  rival_compare: "ライバルとセクター比較",
  condition_correlation: "コンディション相関グラフ",
  video_upload: "車載動画アップロード",
  csv_export: "ラップデータCSVエクスポート",
  record_alerts: "ベスト更新通知",
  private_mode: "プライベートモード",
  page_themes: "ユーザーページ装飾",
  premium_badge: "Premiumバッジ",
  telemetry_import: "テレメトリーCSV取込",
  ai_analysis: "AIラップ分析",
  coaching: "コーチング機能",
  team_features: "チーム機能",
  api_access: "API アクセス"
};

/**
 * デフォルト値 (DB が空の場合のフォールバック)。
 * 価格は migration 004_monetization.sql と同期させること。
 */
export const DEFAULT_PLANS: Record<PlanTier, PlanLimit> = {
  free: {
    tier: "free",
    max_cars: 3,
    max_lap_photos: 1,
    max_laps_per_month: 10,
    max_video_seconds: 0,
    features: ["basic_ranking", "basic_share"],
    display_name: "Free",
    description: "無料プラン。サービスお試し用。",
    monthly_price_jpy: 0,
    yearly_price_jpy: 0
  },
  premium: {
    tier: "premium",
    max_cars: null,
    max_lap_photos: 10,
    max_laps_per_month: null,
    max_video_seconds: 300,
    features: [
      "basic_ranking",
      "basic_share",
      "no_ads",
      "detailed_analytics",
      "rival_compare",
      "condition_correlation",
      "video_upload",
      "csv_export",
      "record_alerts",
      "private_mode",
      "page_themes",
      "premium_badge"
    ],
    display_name: "Premium",
    description: "走り込み派におすすめ。広告非表示・分析グラフ・動画対応。",
    monthly_price_jpy: 390,
    yearly_price_jpy: 3900
  },
  pro: {
    tier: "pro",
    max_cars: null,
    max_lap_photos: null,
    max_laps_per_month: null,
    max_video_seconds: 1800,
    features: [
      "basic_ranking",
      "basic_share",
      "no_ads",
      "detailed_analytics",
      "rival_compare",
      "condition_correlation",
      "video_upload",
      "csv_export",
      "record_alerts",
      "private_mode",
      "page_themes",
      "premium_badge",
      "telemetry_import",
      "ai_analysis",
      "coaching",
      "team_features",
      "api_access"
    ],
    display_name: "Pro",
    description: "ヘビーユーザー向け。テレメトリー連携・AI 分析・チーム機能。",
    monthly_price_jpy: 980,
    yearly_price_jpy: 9800
  }
};

export function hasFeature(plan: PlanLimit | null, key: FeatureKey): boolean {
  return !!plan?.features?.includes(key);
}

export function compareTiers(a: PlanTier, b: PlanTier): number {
  const order: PlanTier[] = ["free", "premium", "pro"];
  return order.indexOf(a) - order.indexOf(b);
}

export function isAtLeast(plan: PlanLimit | null, tier: PlanTier): boolean {
  if (!plan) return false;
  return compareTiers(plan.tier, tier) >= 0;
}
