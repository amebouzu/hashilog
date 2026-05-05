import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  formatLapMs,
  EVENT_TYPE_LABEL,
  type Circuit,
  type CircuitEvent
} from "@/lib/types";
import { getCircuitDetail } from "@/lib/circuit-details";
import { LapRow, LapTableHeader } from "@/components/LapRow";

export const dynamic = "force-dynamic";

export default async function CircuitDetailPage({
  params
}: {
  params: { slug: string };
}) {
  const supabase = createClient();
  const { data: circuit } = await supabase
    .from("circuits")
    .select("*")
    .eq("slug", params.slug)
    .maybeSingle();
  if (!circuit) notFound();

  const c = circuit as Circuit;
  const detail = getCircuitDetail(c.slug);

  const [{ data: laps }, { data: events }, { data: { user } }] = await Promise.all([
    supabase
      .from("lap_times")
      .select(
        "id, total_ms, top_speed_kmh, weather, track_condition, driven_at, tire_size, tire_size_front, tire_size_rear, profiles(username, display_name), cars(name, maker, model), tires(brand, model)"
      )
      .eq("circuit_id", c.id)
      .order("total_ms", { ascending: true })
      .limit(50),
    supabase
      .from("circuit_events")
      .select("*")
      .eq("circuit_id", c.id)
      .eq("is_published", true)
      .order("starts_at", { ascending: true, nullsFirst: false })
      .limit(20),
    supabase.auth.getUser()
  ]);

  // Check if logged-in user is staff for this circuit
  let isStaff = false;
  if (user) {
    const { data: staffRow } = await supabase
      .from("circuit_staff")
      .select("id")
      .eq("user_id", user.id)
      .eq("circuit_id", c.id)
      .maybeSingle();
    isStaff = !!staffRow;
  }

  const lapCount = laps?.length ?? 0;
  const fastestLap = laps && laps.length > 0 ? laps[0] : null;
  const upcomingEvents = (events ?? []) as CircuitEvent[];

  return (
    <div className="space-y-8">
      {/* ===== Hero ===== */}
      <header className="hero rounded-xl p-5 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-racing-red">
          {c.prefecture}
          {detail?.city ? ` · ${detail.city.replace(c.prefecture, "")}` : ""}
        </p>
        <h1 className="mt-2 text-2xl font-bold text-zinc-900 sm:text-4xl">
          {c.name}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-zinc-600">
          {c.length_m && (
            <span>
              全長 <span className="font-bold tabular text-zinc-900">{c.length_m.toLocaleString()}</span> m
            </span>
          )}
          {detail?.corners != null && (
            <span>
              コーナー <span className="font-bold tabular text-zinc-900">{detail.corners}</span>
            </span>
          )}
          {detail?.elevation_m != null && (
            <span>
              高低差 <span className="font-bold tabular text-zinc-900">{detail.elevation_m}</span> m
            </span>
          )}
          <span>
            セクター <span className="font-bold tabular text-zinc-900">{c.sectors}</span>
          </span>
          {detail?.opened_year && (
            <span>
              開業 <span className="font-bold tabular text-zinc-900">{detail.opened_year}</span> 年
            </span>
          )}
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            href={`/laps/new?circuit=${c.id}`}
            className="rounded bg-racing-red px-4 py-2 text-sm font-bold text-white hover:bg-red-700"
          >
            このサーキットでタイム投稿
          </Link>
          {detail?.official_url && (
            <a
              href={detail.official_url}
              target="_blank"
              rel="noreferrer"
              className="rounded border border-zinc-300 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
            >
              公式サイト ↗
            </a>
          )}
          {detail?.city && (
            <a
              href={`https://www.google.com/maps/search/${encodeURIComponent(c.name)}`}
              target="_blank"
              rel="noreferrer"
              className="rounded border border-zinc-300 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
            >
              地図で見る ↗
            </a>
          )}
        </div>
      </header>

      {/* ===== Description ===== */}
      {detail?.description && (
        <section className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">
            サーキット紹介
          </h2>
          <p className="whitespace-pre-wrap leading-relaxed text-zinc-800">
            {detail.description}
          </p>
        </section>
      )}

      {/* ===== Features grid ===== */}
      {(detail?.features?.length ||
        detail?.famous_corners?.length ||
        detail?.events?.length ||
        detail?.typical_use?.length) && (
        <section className="grid gap-4 sm:grid-cols-2">
          {detail?.features && detail.features.length > 0 && (
            <InfoBlock title="特徴">
              <ul className="space-y-1.5 text-sm text-zinc-800">
                {detail.features.map((f, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="mt-1.5 h-1 w-1 flex-none rounded-full bg-racing-red" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </InfoBlock>
          )}
          {detail?.famous_corners && detail.famous_corners.length > 0 && (
            <InfoBlock title="名物コーナー">
              <ul className="flex flex-wrap gap-1.5">
                {detail.famous_corners.map((c, i) => (
                  <li
                    key={i}
                    className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-0.5 text-xs text-zinc-700"
                  >
                    {c}
                  </li>
                ))}
              </ul>
            </InfoBlock>
          )}
          {detail?.events && detail.events.length > 0 && (
            <InfoBlock title="主な開催イベント">
              <ul className="flex flex-wrap gap-1.5">
                {detail.events.map((e, i) => (
                  <li
                    key={i}
                    className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-0.5 text-xs text-zinc-700"
                  >
                    {e}
                  </li>
                ))}
              </ul>
            </InfoBlock>
          )}
          {detail?.typical_use && detail.typical_use.length > 0 && (
            <InfoBlock title="主な利用形態">
              <ul className="flex flex-wrap gap-1.5">
                {detail.typical_use.map((u, i) => (
                  <li
                    key={i}
                    className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-0.5 text-xs text-zinc-700"
                  >
                    {u}
                  </li>
                ))}
              </ul>
            </InfoBlock>
          )}
        </section>
      )}

      {/* ===== Events / Announcements ===== */}
      <section className="space-y-4 border-t border-zinc-200 pt-8">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold text-zinc-900">
              イベント・走行会
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              {upcomingEvents.length > 0
                ? `${upcomingEvents.length}件の予定 · 運営者によって更新`
                : "現在告知中の予定はありません"}
            </p>
          </div>
          {isStaff && (
            <Link
              href={`/circuits/${c.slug}/edit`}
              className="rounded bg-amber-500 px-3 py-1.5 text-sm font-bold text-white hover:bg-amber-600"
            >
              ✎ ページを編集 (運営者)
            </Link>
          )}
        </div>
        {upcomingEvents.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {upcomingEvents.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        ) : (
          <p className="rounded-lg border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500">
            告知準備中
          </p>
        )}
      </section>

      {/* ===== Lap Section ===== */}
      <section className="space-y-4 border-t border-zinc-200 pt-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-zinc-900">
              {c.name} のタイム
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              {lapCount > 0
                ? `登録 ${lapCount} 件 · ベスト ${formatLapMs(fastestLap!.total_ms)}`
                : "まだタイムがありません"}
            </p>
          </div>
          <Link
            href={`/laps/new?circuit=${c.id}`}
            className="text-sm text-racing-red hover:underline"
          >
            + タイム投稿
          </Link>
        </div>

        {laps && laps.length > 0 ? (
          <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
            <LapTableHeader />
            <ol className="divide-y divide-zinc-200">
              {(laps as any[]).map((l, i) => (
                <LapRow
                  key={l.id}
                  lap={{ ...l, circuits: null, rank: i + 1 }}
                />
              ))}
            </ol>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-zinc-300 p-10 text-center">
            <p className="text-sm text-zinc-500">
              このサーキットのタイム投稿が、まだありません。
            </p>
            <Link
              href={`/laps/new?circuit=${c.id}`}
              className="mt-4 inline-block rounded bg-racing-red px-4 py-2 text-sm font-bold text-white hover:bg-red-700"
            >
              最初の一人になる
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}

function InfoBlock({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
        {title}
      </h3>
      {children}
    </div>
  );
}

const BADGE_CLASS: Record<CircuitEvent["event_type"], string> = {
  session: "bg-blue-100 text-blue-800",
  event: "bg-amber-100 text-amber-800",
  race: "bg-red-100 text-red-800",
  news: "bg-zinc-100 text-zinc-700"
};

function formatEventDate(e: CircuitEvent): string {
  if (e.date_label) return e.date_label;
  if (e.starts_at) {
    const start = new Date(e.starts_at).toLocaleDateString("ja-JP");
    if (e.ends_at) {
      const end = new Date(e.ends_at).toLocaleDateString("ja-JP");
      return `${start} – ${end}`;
    }
    return start;
  }
  return "";
}

function EventCard({ event }: { event: CircuitEvent }) {
  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    event.external_url ? (
      <a
        href={event.external_url}
        target="_blank"
        rel="noreferrer"
        className="block rounded-lg border border-zinc-200 bg-white p-4 transition hover:border-racing-red"
      >
        {children}
      </a>
    ) : (
      <article className="rounded-lg border border-zinc-200 bg-white p-4">
        {children}
      </article>
    );

  return (
    <Wrapper>
      <div className="flex items-baseline justify-between gap-2">
        <span
          className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${BADGE_CLASS[event.event_type]}`}
        >
          {EVENT_TYPE_LABEL[event.event_type]}
        </span>
        <span className="text-xs tabular text-zinc-500">
          {formatEventDate(event)}
        </span>
      </div>
      <h3 className="mt-2 font-bold text-zinc-900">{event.title}</h3>
      {event.body && (
        <p className="mt-1 text-sm text-zinc-600">{event.body}</p>
      )}
    </Wrapper>
  );
}
