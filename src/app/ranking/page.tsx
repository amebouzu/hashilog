import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LapSlider } from "@/components/LapSlider";
import { LapRow, LapTableHeader } from "@/components/LapRow";
import { prefectureOrder } from "@/lib/types";

export const dynamic = "force-dynamic";

type SP = {
  circuit?: string;
  maker?: string;
  model?: string;
  brand?: string;
  tire?: string;
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
       profiles(username),
       cars(name, maker, model),
       circuits(name, slug)`
    )
    .order("total_ms", { ascending: true })
    .limit(100);
  if (circuitId) q = q.eq("circuit_id", circuitId);
  // タイヤ銘柄での絞り込み: フロント or リアのどちらかが一致すればヒット
  if (tireId)
    q = q.or(`tire_id_front.eq.${tireId},tire_id_rear.eq.${tireId},tire_id.eq.${tireId}`);

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

  // Build dropdown options
  const makers = uniq((makerRows ?? []).map((r) => r.maker)).sort();
  const models = uniq(
    (makerRows ?? [])
      .filter((r) => !searchParams.maker || r.maker === searchParams.maker)
      .map((r) => r.model)
  ).sort();
  const brands = uniq((tireRows ?? []).map((r) => r.brand)).sort();
  const tireModels = uniq(
    (tireRows ?? [])
      .filter((r) => !searchParams.brand || r.brand === searchParams.brand)
      .map((r) => r.model)
  ).sort();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900">ランキング</h1>

      <LapSlider laps={(latestLaps ?? []) as any} />

      {/* ===== Filters ===== */}
      <section>
        <div className="mb-2 flex items-end justify-between">
          <h2 className="text-sm font-semibold text-zinc-700">
            条件で絞り込む
          </h2>
          <Link
            href="/ranking"
            className="text-xs text-racing-red hover:underline"
          >
            すべて解除
          </Link>
        </div>
        <form
          method="get"
          className="grid grid-cols-1 gap-3 rounded-lg border border-zinc-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-5"
        >
          <FilterSelect
            name="circuit"
            label="サーキット"
            value={searchParams.circuit ?? ""}
            options={[
              { value: "", label: "すべて" },
              // 都道府県順 (北→南) で並べ、同県内は名前順
              ...((circuits ?? [])
                .slice()
                .sort((a, b) => {
                  const oa = prefectureOrder(a.prefecture);
                  const ob = prefectureOrder(b.prefecture);
                  if (oa !== ob) return oa - ob;
                  return a.name.localeCompare(b.name, "ja");
                })
                .map((c) => ({ value: c.slug, label: c.name })))
            ]}
          />
          <FilterSelect
            name="maker"
            label="メーカー"
            value={searchParams.maker ?? ""}
            options={[
              { value: "", label: "すべて" },
              ...makers.map((m) => ({ value: m, label: m }))
            ]}
          />
          <FilterSelect
            name="model"
            label="車種"
            value={searchParams.model ?? ""}
            options={[
              { value: "", label: "すべて" },
              ...models.map((m) => ({ value: m, label: m }))
            ]}
          />
          <FilterSelect
            name="brand"
            label="タイヤブランド"
            value={searchParams.brand ?? ""}
            options={[
              { value: "", label: "すべて" },
              ...brands.map((b) => ({ value: b, label: b }))
            ]}
          />
          <FilterSelect
            name="tire"
            label="タイヤ銘柄"
            value={searchParams.tire ?? ""}
            options={[
              { value: "", label: "すべて" },
              ...tireModels.map((m) => ({ value: m, label: m }))
            ]}
          />
          <div className="flex gap-2 sm:col-span-2 lg:col-span-5">
            <button
              type="submit"
              className="rounded bg-racing-red px-4 py-1.5 text-sm font-bold text-white hover:bg-red-700"
            >
              この条件で検索
            </button>
            <Link
              href="/ranking"
              className="rounded border border-zinc-300 px-4 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50"
            >
              リセット
            </Link>
          </div>
        </form>
      </section>

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

function uniq<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

function FilterSelect({
  name,
  label,
  value,
  options
}: {
  name: string;
  label: string;
  value: string;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-zinc-500">{label}</span>
      <select
        name={name}
        defaultValue={value}
        className="w-full rounded border border-zinc-300 bg-white px-2 py-2 text-sm text-zinc-900 focus:border-racing-red focus:outline-none focus:ring-2 focus:ring-red-100"
      >
        {options.map((o) => (
          <option key={`${o.value}-${o.label}`} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
