import { createClient } from "@/lib/supabase/server";
import { LapSlider } from "@/components/LapSlider";
import { LapRow, LapTableHeader } from "@/components/LapRow";
import { RankingFilters } from "@/components/RankingFilters";
import { prefectureOrder } from "@/lib/types";

export const dynamic = "force-dynamic";

type SP = {
  circuit?: string;
  maker?: string;
  model?: string;
  brand?: string;
  tire?: string;
  user?: string;
};

export default async function RankingPage({
  searchParams
}: {
  searchParams: SP;
}) {
  const supabase = createClient();

  const [
    { data: circuits },
    { data: latestLaps },
    { data: makerRows },
    { data: tireRows }
  ] = await Promise.all([
    supabase
      .from("circuits")
      .select("id,slug,name,prefecture")
      .eq("is_published", true),
    supabase
      .from("lap_times")
      .select(
        `id, total_ms, driven_at,
         profiles(username),
         cars(maker, model),
         circuits(name)`
      )
      .order("created_at", { ascending: false })
      .limit(5),
    supabase.from("cars").select("maker, model"),
    supabase.from("tires").select("brand, model")
  ]);

  // Resolve circuit slug → id
  const selectedCircuit = searchParams.circuit
    ? circuits?.find((c) => c.slug === searchParams.circuit)
    : undefined;
  const circuitId = selectedCircuit?.id;

  // Resolve tire model → tire_id
  let tireId: string | undefined;
  if (searchParams.tire) {
    const { data: t } = await supabase
      .from("tires")
      .select("id")
      .eq("brand", searchParams.brand ?? "")
      .eq("model", searchParams.tire)
      .maybeSingle();
    tireId = t?.id;
  }

  // Resolve user search → user_ids
  // username or display_name の部分一致 (大文字小文字無視) で profile を検索し、
  // ヒットしたユーザーの id 一覧でラップを絞り込む。
  // 0 件マッチした場合は「該当なし」を出すために空配列を保持。
  let userIds: string[] | null = null;
  const userQuery = (searchParams.user ?? "").trim();
  if (userQuery) {
    // Postgres LIKE 用にメタ文字 ( % _ ) をエスケープ
    const pattern = `%${userQuery.replace(/[%_]/g, (m) => `\\${m}`)}%`;
    const { data: matched } = await supabase
      .from("profiles")
      .select("id")
      .or(`username.ilike.${pattern},display_name.ilike.${pattern}`)
      .limit(200);
    userIds = (matched ?? []).map((m) => m.id);
  }

  // Build the ranking query with filters.
  // tires への自動 join は FK が3本 (tire_id / tire_id_front / tire_id_rear) になり
  // PostgREST が曖昧と判定するためエラー化していた。ここでは tires は join せず、
  // 取得後に in() で一括取得して合成する。
  let q = supabase
    .from("lap_times")
    .select(
      `id, total_ms, top_speed_kmh, weather, track_condition, driven_at,
       tire_size, tire_size_front, tire_size_rear,
       tire_id, tire_id_front, tire_id_rear,
       profiles(username, display_name, avatar_url),
       cars(name, maker, model),
       circuits(name, slug)`
    )
    .order("total_ms", { ascending: true })
    .limit(100);
  if (circuitId) q = q.eq("circuit_id", circuitId);
  // タイヤ銘柄での絞り込み: フロント or リアのどちらかが一致すればヒット
  if (tireId)
    q = q.or(`tire_id_front.eq.${tireId},tire_id_rear.eq.${tireId},tire_id.eq.${tireId}`);
  // ユーザー検索: 該当ユーザーがいる時はその user_id 配列で絞り込み。
  // 検索文字列はあるが 0 ヒットの場合は明示的に「結果ゼロ」になるよう詰む。
  if (userIds !== null) {
    if (userIds.length === 0) {
      q = q.eq("user_id", "00000000-0000-0000-0000-000000000000");
    } else {
      q = q.in("user_id", userIds);
    }
  }

  const { data: laps } = await q;

  // 関連タイヤを一括取得して各ラップに合成
  const lapList = (laps ?? []) as any[];
  const tireIdsAll = Array.from(
    new Set(
      lapList
        .flatMap((l) => [l.tire_id, l.tire_id_front, l.tire_id_rear])
        .filter((x): x is string => !!x)
    )
  );
  const knownTireById: Record<string, { brand: string; model: string }> = {};
  if (tireIdsAll.length > 0) {
    const { data: extra } = await supabase
      .from("tires")
      .select("id, brand, model")
      .in("id", tireIdsAll);
    for (const t of extra ?? []) {
      knownTireById[t.id] = { brand: t.brand, model: t.model };
    }
  }
  for (const l of lapList) {
    l.tires = l.tire_id ? knownTireById[l.tire_id] ?? null : null;
    l.tires_front = l.tire_id_front ? knownTireById[l.tire_id_front] ?? null : null;
    l.tires_rear = l.tire_id_rear ? knownTireById[l.tire_id_rear] ?? null : null;
  }

  // Filter by car maker/model + tire brand on client side via the joined data.
  // タイヤブランドはフロント/リアのどちらかが一致すればヒット (旧 tires も互換でチェック)
  const filtered = lapList.filter((l: any) => {
    if (searchParams.maker && l.cars?.maker !== searchParams.maker) return false;
    if (searchParams.model && l.cars?.model !== searchParams.model) return false;
    if (searchParams.brand) {
      const brands = [
        l.tires_front?.brand,
        l.tires_rear?.brand,
        l.tires?.brand
      ].filter(Boolean);
      if (!brands.includes(searchParams.brand)) return false;
    }
    return true;
  });

  // サーキットは都道府県順 (北→南) で並べる
  const sortedCircuits = (circuits ?? []).slice().sort((a, b) => {
    const oa = prefectureOrder(a.prefecture);
    const ob = prefectureOrder(b.prefecture);
    if (oa !== ob) return oa - ob;
    return a.name.localeCompare(b.name, "ja");
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900">ランキング</h1>

      <LapSlider laps={(latestLaps ?? []) as any} />

      {/* ===== Filters (client component で連動絞込) ===== */}
      <RankingFilters
        initial={{
          user: searchParams.user,
          circuit: searchParams.circuit,
          maker: searchParams.maker,
          model: searchParams.model,
          brand: searchParams.brand,
          tire: searchParams.tire
        }}
        circuits={sortedCircuits}
        cars={(makerRows ?? []) as { maker: string; model: string }[]}
        tires={(tireRows ?? []) as { brand: string; model: string }[]}
        resultCount={filtered.length}
      />

      {userQuery && userIds && (
        <p className="text-xs text-zinc-500">
          {userIds.length === 0
            ? `「${userQuery}」に一致するユーザーは見つかりませんでした`
            : `「${userQuery}」 にマッチした ${userIds.length} 名のラップを表示`}
        </p>
      )}

      <p className="text-sm text-zinc-500">
        {filtered.length === 0
          ? "条件にマッチするタイムがありません"
          : `${filtered.length} 件のタイム`}
      </p>

      {filtered.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
          <LapTableHeader />
          <ol className="divide-y divide-zinc-200">
            {filtered.map((l: any, i: number) => (
              <LapRow key={l.id} lap={{ ...l, rank: i + 1 }} />
            ))}
          </ol>
        </div>
      ) : (
        <p className="rounded-lg border border-dashed border-zinc-300 p-10 text-center text-sm text-zinc-500">
          条件を変更してお試しください。
        </p>
      )}
    </div>
  );
}
