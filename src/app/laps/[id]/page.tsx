import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatLapMs, TRACK_LABEL, WEATHER_LABEL } from "@/lib/types";
import { ShareLink } from "@/components/ShareLink";
import { ReportButton } from "@/components/ReportButton";
import { DeleteLapButton } from "@/components/DeleteLapButton";
import { deleteLapAction } from "@/app/actions/laps";

export const dynamic = "force-dynamic";

async function loadLap(id: string) {
  const supabase = createClient();
  // tires の自動 join は (lap_times → tires) の FK が tire_id / tire_id_front /
  // tire_id_rear の3本になってから PostgREST が解決できなくなったので、
  // ここでは tires は一切 join せず、後追いで .in("id", ...) で一括取得する。
  const { data: lap, error } = await supabase
    .from("lap_times")
    .select(
      `*,
       profiles(username, display_name),
       cars(name, maker, model, year),
       circuits(name, slug, prefecture, sectors),
       lap_photos(id, storage_path, caption)`
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("loadLap failed:", error.message);
    return null;
  }
  if (!lap) return null;

  // 関連タイヤをまとめ取り
  const tireIds = Array.from(
    new Set(
      [lap.tire_id, lap.tire_id_front, lap.tire_id_rear].filter(
        (x): x is string => !!x
      )
    )
  );
  const tiresMap: Record<string, { brand: string; model: string }> = {};
  if (tireIds.length > 0) {
    const { data: extra } = await supabase
      .from("tires")
      .select("id, brand, model")
      .in("id", tireIds);
    for (const t of extra ?? []) {
      tiresMap[t.id] = { brand: t.brand, model: t.model };
    }
  }

  return {
    ...lap,
    tires: lap.tire_id ? tiresMap[lap.tire_id] ?? null : null,
    tires_front: lap.tire_id_front ? tiresMap[lap.tire_id_front] ?? null : null,
    tires_rear: lap.tire_id_rear ? tiresMap[lap.tire_id_rear] ?? null : null
  };
}

export async function generateMetadata({
  params
}: {
  params: { id: string };
}): Promise<Metadata> {
  const lap = await loadLap(params.id);
  if (!lap) return { title: "ラップが見つかりません" };
  const title = `${formatLapMs(lap.total_ms)} @ ${lap.circuits.name} — ${lap.cars.maker} ${lap.cars.model}`;
  const desc = `@${lap.profiles.username} のタイム · ${lap.cars.maker} ${lap.cars.model} · ${WEATHER_LABEL[lap.weather as keyof typeof WEATHER_LABEL]} ${TRACK_LABEL[lap.track_condition as keyof typeof TRACK_LABEL]}`;
  return {
    title,
    description: desc,
    openGraph: { title, description: desc, type: "article" },
    twitter: { card: "summary_large_image", title, description: desc }
  };
}

export default async function LapDetailPage({
  params
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const lap = await loadLap(params.id);
  if (!lap) notFound();

  const {
    data: { user }
  } = await supabase.auth.getUser();
  const isOwner = user?.id === lap.user_id;

  const photos = (lap.lap_photos ?? []).map((p: any) => {
    const { data } = supabase.storage
      .from("lap-photos")
      .getPublicUrl(p.storage_path);
    return { ...p, url: data.publicUrl };
  });

  const sectors = [
    lap.sector1_ms,
    lap.sector2_ms,
    lap.sector3_ms,
    lap.sector4_ms
  ].filter((s): s is number => s != null);

  return (
    <article className="space-y-6">
      <header className="rounded-lg border border-zinc-200 bg-white p-6">
        <p className="text-xs text-zinc-500">
          <Link
            href={`/circuits/${lap.circuits.slug}`}
            className="hover:text-zinc-900"
          >
            {lap.circuits.name}
          </Link>{" "}
          · {lap.driven_at}
        </p>
        <p className="mt-2 font-mono text-5xl font-black lap-time tabular">
          {formatLapMs(lap.total_ms)}
        </p>
        <p className="mt-3 text-sm text-zinc-700">
          <Link
            href={`/u/${lap.profiles.username}`}
            className="hover:underline"
          >
            @{lap.profiles.username}
          </Link>{" "}
          /{" "}
          <Link href={`/cars/${lap.car_id}`} className="hover:underline">
            {lap.cars.maker} {lap.cars.model} ({lap.cars.name})
          </Link>
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <Stat
          label="天候 / 路面"
          value={`${WEATHER_LABEL[lap.weather as keyof typeof WEATHER_LABEL]} / ${TRACK_LABEL[lap.track_condition as keyof typeof TRACK_LABEL]}`}
        />
        <Stat
          label="気温 / 路温"
          value={`${lap.air_temp_c ?? "-"}℃ / ${lap.track_temp_c ?? "-"}℃`}
        />
        <Stat
          label="最高速"
          value={lap.top_speed_kmh ? `${lap.top_speed_kmh} km/h` : "-"}
        />
        {(() => {
          // 前後分離フィールドが入っていなければ legacy の lap.tires にフォールバック
          const front = lap.tires_front ?? lap.tires ?? null;
          const rear = lap.tires_rear ?? lap.tires ?? null;
          const sameTire =
            (front?.brand ?? null) === (rear?.brand ?? null) &&
            (front?.model ?? null) === (rear?.model ?? null);
          const sizeFront = lap.tire_size_front ?? lap.tire_size ?? null;
          const sizeRear =
            lap.tire_size_rear ?? lap.tire_size_front ?? lap.tire_size ?? null;
          const sameSize = sizeFront === sizeRear;

          return (
            <>
              {sameTire ? (
                <>
                  <Stat label="タイヤブランド" value={front?.brand ?? "-"} />
                  <Stat label="タイヤ銘柄" value={front?.model ?? "-"} />
                </>
              ) : (
                <>
                  <Stat
                    label="タイヤ (フロント)"
                    value={
                      front
                        ? `${front.brand} / ${front.model}`
                        : "-"
                    }
                  />
                  <Stat
                    label="タイヤ (リア)"
                    value={
                      rear
                        ? `${rear.brand} / ${rear.model}`
                        : "-"
                    }
                  />
                </>
              )}
              <Stat
                label={sameSize ? "タイヤサイズ" : "タイヤサイズ (フロント)"}
                value={sizeFront ?? "-"}
              />
              {!sameSize && (
                <Stat
                  label="タイヤサイズ (リア)"
                  value={sizeRear ?? "-"}
                />
              )}
            </>
          );
        })()}
      </section>

      {sectors.length > 0 && (
        <section>
          <h2 className="mb-2 text-lg font-bold text-zinc-900">セクタータイム</h2>
          <ul className="grid gap-2 sm:grid-cols-4">
            {sectors.map((s, i) => (
              <li
                key={i}
                className="rounded-lg border border-zinc-200 bg-zinc-50 p-3"
              >
                <p className="text-xs text-zinc-500">セクター{i + 1}</p>
                <p className="font-mono text-lg tabular text-zinc-800">
                  {formatLapMs(s)}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {lap.note && (
        <section>
          <h2 className="mb-2 text-lg font-bold text-zinc-900">メモ</h2>
          <p className="whitespace-pre-wrap rounded-lg border border-zinc-200 bg-white p-4 text-sm text-zinc-700">
            {lap.note}
          </p>
        </section>
      )}

      {photos.length > 0 && (
        <section>
          <h2 className="mb-2 text-lg font-bold text-zinc-900">エビデンス写真</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {photos.map((p: any) => (
              <a
                key={p.id}
                href={p.url}
                target="_blank"
                rel="noreferrer"
                className="block overflow-hidden rounded-lg border border-zinc-200"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.url}
                  alt={p.caption ?? "lap evidence"}
                  className="h-auto w-full object-cover"
                />
              </a>
            ))}
          </div>
        </section>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-zinc-200 pt-4 text-sm">
        <div className="flex gap-2">
          <ShareLink platform="x" />
          <ShareLink platform="line" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isOwner && (
            <>
              <Link
                href={`/laps/${lap.id}/edit`}
                className="rounded border border-zinc-300 px-3 py-1 text-zinc-700 hover:bg-zinc-50"
              >
                編集
              </Link>
              <DeleteLapButton
                action={async () => {
                  "use server";
                  await deleteLapAction(lap.id);
                }}
              />
            </>
          )}
          <ReportButton subjectType="lap_time" subjectId={lap.id} />
        </div>
      </div>
    </article>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 text-sm text-zinc-800">{value}</p>
    </div>
  );
}
