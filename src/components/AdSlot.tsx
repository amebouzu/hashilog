/**
 * 広告枠 (Server Component)
 *
 * - feature_flags.ads_enabled が false なら何も描画しない
 * - DB の ad_slots に登録された html を埋め込む
 * - visible_to_free_only=true の場合、有料ユーザーには表示しない
 */

import { createClient } from "@/lib/supabase/server";
import { getFeatureFlags } from "@/lib/feature-flags";
import { getUserPlan } from "@/lib/limits";
import { hasFeature } from "@/lib/plans";

export async function AdSlot({
  slotKey,
  className = ""
}: {
  slotKey: string;
  className?: string;
}) {
  const flags = await getFeatureFlags();
  if (!flags.ads_enabled) return null;

  const supabase = createClient();
  const { data: slot } = await supabase
    .from("ad_slots")
    .select("enabled, html, fallback_text, visible_to_free_only")
    .eq("slot_key", slotKey)
    .maybeSingle();

  if (!slot || !slot.enabled || !slot.html) return null;

  // 有料ユーザーは広告非表示
  if (slot.visible_to_free_only) {
    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (user) {
      const plan = await getUserPlan(user.id);
      if (hasFeature(plan, "no_ads")) return null;
    }
  }

  return (
    <div
      className={`overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50 ${className}`}
      data-ad-slot={slotKey}
      // 広告タグはサニタイズされた信頼できるソースのみ使用すること
      dangerouslySetInnerHTML={{ __html: slot.html }}
    />
  );
}
