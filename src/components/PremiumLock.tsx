/**
 * 有料機能のロック表示
 *
 * - feature_flags.premium_features_visible が false → 何も描画しない (機能完全非表示)
 * - true → ロックされた状態で UI に表示し、アップグレード CTA を出す
 *
 * 使用例:
 *   <PremiumLock feature="detailed_analytics">
 *     <ChartComponent />
 *   </PremiumLock>
 */

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getFeatureFlags } from "@/lib/feature-flags";
import { getUserPlan } from "@/lib/limits";
import { hasFeature, type FeatureKey, FEATURE_LABEL } from "@/lib/plans";

export async function PremiumLock({
  feature,
  children,
  fallback
}: {
  feature: FeatureKey;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const flags = await getFeatureFlags();
  if (!flags.premium_features_visible) {
    // 機能を一切公開していない期間 (お試し運用) → 何も描画しない
    return null;
  }

  // ログインユーザーのプランをチェック
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user) {
    const plan = await getUserPlan(user.id);
    if (hasFeature(plan, feature)) {
      // 利用可能 → 通常表示
      return <>{children}</>;
    }
  }

  // ロック表示
  return (
    <div className="relative overflow-hidden rounded-lg border border-amber-200 bg-amber-50/50">
      <div className="pointer-events-none select-none opacity-30 blur-sm">
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
        <span className="mb-1 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-950">
          ★ Premium
        </span>
        <p className="mb-2 text-sm font-bold text-zinc-800">
          {FEATURE_LABEL[feature]}
        </p>
        <p className="mb-3 text-xs text-zinc-600">
          有料プランで利用できる機能です
        </p>
        {fallback ?? (
          <Link
            href="/billing"
            className="rounded bg-racing-red px-3 py-1 text-xs font-bold text-white hover:bg-red-700"
          >
            プランを見る
          </Link>
        )}
      </div>
    </div>
  );
}
