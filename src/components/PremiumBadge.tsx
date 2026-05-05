/**
 * プラン表示用バッジ
 * - Premium: 金色
 * - Pro: 紫色
 * - Free は何も表示しない
 */

import type { PlanTier } from "@/lib/plans";

const STYLES: Record<Exclude<PlanTier, "free">, string> = {
  premium:
    "bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950 border-amber-300",
  pro: "bg-gradient-to-r from-purple-500 to-fuchsia-600 text-white border-purple-400"
};

const LABELS: Record<Exclude<PlanTier, "free">, string> = {
  premium: "Premium",
  pro: "Pro"
};

export function PremiumBadge({
  tier,
  size = "sm"
}: {
  tier: PlanTier;
  size?: "xs" | "sm" | "md";
}) {
  if (tier === "free") return null;
  const padding =
    size === "xs"
      ? "px-1.5 py-0.5 text-[9px]"
      : size === "sm"
        ? "px-2 py-0.5 text-[10px]"
        : "px-2.5 py-1 text-xs";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-bold uppercase tracking-wider ${STYLES[tier]} ${padding}`}
    >
      ★ {LABELS[tier]}
    </span>
  );
}
