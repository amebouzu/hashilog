import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatLapMs, type Car, type LapTime } from "@/lib/types";
import { deleteCarAction } from "@/app/actions/cars";
import { ShareButtons } from "@/components/ShareButtons";

export const dynamic = "force-dynamic";

export default async function CarDetailPage({
  params
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { data: car } = await supabase
    .from("cars")
    .select("*, profiles(username, display_name)")
    .eq("id", params.id)
    .maybeSingle();
  if (!car) notFound();

  const {
    data: { user }
  } = await supabase.auth.getUser();
  const isOwner = user?.id === car.user_id;

  const { data: laps } = await supabase
    .from("lap_times")
    .select("*, circuits(name, slug)")
    .eq("car_id", params.id)
    .order("total_ms", { ascending: true })
    .limit(20);

  const c = car as Car & {
    profiles: { username: string; display_name: string | null };
  };

  const mods: { label: string; value: string | null }[] = [
    { label: "足回り", value: c.mods_suspension },
    { label: "エンジン", value: c.mods_engine },
    { label: "駆動系", value: c.mods_drivetrain },
    { label: "ブレーキ", value: c.mods_brake },
    { label: "外装", value: c.mods_exterior },
    { label: "内装", value: c.mods_interior }
  ];

  return (
    <div className="space-y-6">
      <header className="rounded-lg border border-zinc-200 bg-white p-6">
        <p className="text-xs text-zinc-500">
          {c.maker} {c.year ? `· ${c.year}` : ""} · オーナー{" "}
          <Link
            href={`/u/${c.profiles.username}`}
            className="underline hover:text-zinc-900"
          >
            @{c.profiles.username}
          </Link>
        </p>
        <h1 className="mt-1 text-3xl font-bold text-zinc-900">{c.name}</h1>
        <p className="text-zinc-700">{c.model}</p>
        <div className="mt-3 flex gap-4 text-sm text-zinc-500">
          {c.power_ps && <span>{c.power_ps} PS</span>}
          {c.weight_kg && <span>{c.weight_kg} kg</span>}
          {c.color && <span>{c.color}</span>}
        </div>
        {c.description && (
          <p className="mt-4 whitespace-pre-wrap text-sm text-zinc-700">
            {c.description}
          </p>
        )}
        {isOwner && (
          <div className="mt-4 flex gap-2">
            <form
              action={async () => {
                "use server";
                await deleteCarAction(c.id);
              }}
            >
              <button
                type="submit"
                className="rounded border border-zinc-300 px-3 py-1 text-xs text-zinc-600 hover:text-red-600 hover:border-red-300"
              >
                削除
              </button>
            </form>
          </div>
        )}
      </header>

      <section>
        <h2 className="mb-3 text-lg font-bold text-zinc-900">チューニング</h2>
        <dl className="grid gap-3 sm:grid-cols-2">
          {mods.map((m) => (
            <div
              key={m.label}
              className="rounded-lg border border-zinc-200 bg-white p-4"
            >
              <dt className="text-xs uppercase tracking-wide text-zinc-500">
                {m.label}
              </dt>
              <dd className="mt-1 whitespace-pre-wrap text-sm text-zinc-800">
                {m.value ?? <span className="text-zinc-400">ノーマル</span>}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-zinc-900">この車のベストラップ</h2>
          {isOwner && (
            <Link
              href={`/laps/new?car=${c.id}`}
              className="text-sm text-racing-red hover:underline"
            >
              + タイム投稿
            </Link>
          )}
        </div>
        {laps && laps.length > 0 ? (
          <ul className="space-y-2">
            {(laps as (LapTime & {
              circuits: { name: string; slug: string };
            })[]).map((l) => {
              const lapText = `⏱️ ${formatLapMs(l.total_ms)} @ ${l.circuits.name} (${c.maker} ${c.model}) - 走ログ #サーキットタイム`;
              const lapUrl = `/laps/${l.id}`;
              return (
                <li
                  key={l.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-2"
                >
                  <Link
                    href={`/circuits/${l.circuits.slug}`}
                    className="flex-1 text-sm text-zinc-800 hover:text-zinc-900"
                  >
                    {l.circuits.name}
                  </Link>
                  <Link
                    href={lapUrl}
                    className="font-mono text-lg font-bold lap-time tabular hover:underline"
                  >
                    {formatLapMs(l.total_ms)}
                  </Link>
                  <ShareButtons
                    text={lapText}
                    url={lapUrl}
                    size="sm"
                    showCopy={false}
                  />
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-zinc-500">まだラップが記録されていません。</p>
        )}
      </section>

      <section className="border-t border-zinc-200 pt-5">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">
          この愛車をシェア
        </h3>
        <ShareButtons
          text={`🏎️ @${c.profiles.username} の愛車「${c.name}」(${c.maker} ${c.model}) - 走ログ`}
        />
        <p className="mt-2 text-xs text-zinc-500">
          改造内容と一緒に愛車紹介ページが共有されます。
        </p>
      </section>
    </div>
  );
}
