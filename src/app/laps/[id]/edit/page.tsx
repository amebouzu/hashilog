import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LapForm, type LapFormDefaults } from "@/components/LapForm";
import { formatLapMs, prefectureOrder } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * ms を フォーム入力用の文字列 ("M:SS.mmm" or null) に変換。
 * セクタータイム未入力時はそのまま空欄に。
 */
function msToInput(ms: number | null | undefined): string {
  if (ms == null) return "";
  return formatLapMs(ms);
}

export default async function LapEditPage({
  params
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/laps/${params.id}/edit`);

  const { data: lap } = await supabase
    .from("lap_times")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();
  if (!lap) notFound();
  if (lap.user_id !== user.id) {
    // 他人のラップは編集不可 → 詳細ページに戻す
    redirect(`/laps/${params.id}`);
  }

  const [{ data: cars }, { data: circuits }, { data: tires }] = await Promise.all([
    supabase
      .from("cars")
      .select("id,name,maker,model")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase.from("circuits").select("id,slug,name,sectors,prefecture"),
    supabase.from("tires").select("id,brand,model").order("brand")
  ]);

  // サーキットは都道府県順 (北→南) → 同県内は名前昇順
  const sortedCircuits = (circuits ?? []).slice().sort((a, b) => {
    const oa = prefectureOrder(a.prefecture);
    const ob = prefectureOrder(b.prefecture);
    if (oa !== ob) return oa - ob;
    return a.name.localeCompare(b.name, "ja");
  });

  const defaults: LapFormDefaults = {
    lapId: lap.id,
    carId: lap.car_id,
    circuitId: lap.circuit_id,
    total: msToInput(lap.total_ms),
    s1: msToInput(lap.sector1_ms),
    s2: msToInput(lap.sector2_ms),
    s3: msToInput(lap.sector3_ms),
    s4: msToInput(lap.sector4_ms),
    topSpeed: lap.top_speed_kmh != null ? String(lap.top_speed_kmh) : "",
    weather: lap.weather ?? "sunny",
    trackCondition: lap.track_condition ?? "dry",
    airTemp: lap.air_temp_c != null ? String(lap.air_temp_c) : "",
    trackTemp: lap.track_temp_c != null ? String(lap.track_temp_c) : "",
    drivenAt: lap.driven_at,
    note: lap.note ?? "",
    tireSizeFront: lap.tire_size_front ?? lap.tire_size ?? "",
    tireSizeRear: lap.tire_size_rear ?? lap.tire_size ?? "",
    tireFrontId: lap.tire_id_front ?? lap.tire_id ?? null,
    tireRearId: lap.tire_id_rear ?? lap.tire_id ?? null
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900">タイムを編集</h1>
        <Link
          href={`/laps/${lap.id}`}
          className="text-sm text-zinc-500 hover:text-zinc-700"
        >
          ← 詳細に戻る
        </Link>
      </div>
      <LapForm
        cars={cars ?? []}
        circuits={sortedCircuits}
        tires={tires ?? []}
        defaults={defaults}
      />
    </div>
  );
}
