/**
 * アフィリエイトリンク表示 (Server Component)
 *
 * - feature_flags.affiliate_enabled が false → 何も描画しない
 * - DB の affiliate_links から resource_type/resource_id にマッチする行を取得
 *
 * 使用例: タイヤ詳細で
 *   <AffiliateLinks resourceType="tire" resourceId={tire.id} />
 */

import { createClient } from "@/lib/supabase/server";
import { getFeatureFlags } from "@/lib/feature-flags";

export async function AffiliateLinks({
  resourceType,
  resourceId,
  className = "",
  label = "このアイテムを購入"
}: {
  resourceType: string;
  resourceId?: string | null;
  className?: string;
  label?: string;
}) {
  const flags = await getFeatureFlags();
  if (!flags.affiliate_enabled) return null;

  const supabase = createClient();
  let q = supabase
    .from("affiliate_links")
    .select("id, network, label, url")
    .eq("resource_type", resourceType)
    .eq("enabled", true)
    .order("position");
  if (resourceId) q = q.eq("resource_id", resourceId);
  const { data: links } = await q;

  if (!links || links.length === 0) return null;

  return (
    <div className={`rounded-lg border border-zinc-200 bg-white p-3 ${className}`}>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
        {label}
        <span className="ml-1 text-[10px] font-normal text-zinc-400">
          (PR)
        </span>
      </p>
      <div className="flex flex-wrap gap-2">
        {links.map((l) => (
          <a
            key={l.id}
            href={l.url}
            target="_blank"
            rel="sponsored noopener noreferrer"
            className="rounded border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-800 hover:border-racing-red hover:bg-red-50"
          >
            {l.label} ↗
          </a>
        ))}
      </div>
    </div>
  );
}
