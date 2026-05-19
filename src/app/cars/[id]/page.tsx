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

  const [{ data: laps }, { data: photos }] = await Promise.all([
    supabase
      .from("lap_times")
      .select("*, circuits(name, slug)")
      .eq("car_id", params.id)
      .order("total_ms", { ascending: true })
      .limit(20),
    supabase
      .from("car_photos")
      .select("id, storage_path, caption, position")
      .eq("car_id", params.id)
      .order("position", { ascending: true })
  ]);

  const c = car as Car & {
    profiles: { username: string; display_name: string | null };
  };

  // 車のギャラリー: storage_path を public URL に解決
  const galleryUrls = (photos ?? []).map((p) => {
    const { data } = supabase.storage
      .from("car-covers")
      .getPublicUrl(p.storage_path);
    return { id: p.id, caption: p.caption, url: data.publicUrl };
  });

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
      <header className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
        <div className="flex flex-col gap-0 sm:flex-row sm:gap-6">
          {/* 左: 4:3 カバー画像 (車は横長なので 4:3 がフィット。スマホは上、PCは左) */}
          {c.cover_url && (
            <div className="aspect-[4/3] w-full flex-shrink-0 overflow-hidden bg-zinc-100 sm:w-72 sm:rounded-l-lg lg:w-80">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={c.cover_url}
                alt={`${c.maker} ${c.model}`}
                className="h-full w-full object-cover"
              />
            </div>
          )}
          {/* 右: 車両名・スペック・メモ・削除ボタン */}
          <div className="min-w-0 flex-1 p-6">
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
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-500">
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
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href={`/cars/${c.id}/edit`}
                  className="rounded border border-zinc-300 px-3 py-1 text-xs text-zinc-700 hover:bg-zinc-50"
                >
                  編集
                </Link>
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
          </div>
        </div>
      </header>

      {/* ギャラリー (登録された追加写真があれば表示) */}
      {galleryUrls.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-bold text-zinc-900">ギャラリー</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {galleryUrls.map((p) => (
              <a
                key={p.id}
                href={p.url}
                target="_blank"
                rel="noreferrer"
                className="block overflow-hidden rounded-lg border border-zinc-200 bg-white"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.url}
                  alt={p.caption ?? `${c.maker} ${c.model}`}
                  className="aspect-[4/3] h-auto w-full object-cover"
                />
                {p.caption && (
                  <p className="px-3 py-2 text-xs text-zinc-600">{p.caption}</p>
                )}
              </a>
            ))}
          </div>
        </section>
      )}

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
                  className="rounded-lg border border-zinc-200 bg-white transition hover:border-racing-red"
                >
                  {/* 行全体をタイム詳細へのリンクにする (旧: サーキットページに飛んでしまっていた) */}
                  <Link
                    href={lapUrl}
                    className="flex items-center justify-between gap-3 px-4 py-2"
                  >
                    <span className="flex-1 text-sm text-zinc-800">
                      {l.circuits.name}
                    </span>
                    <span className="font-mono text-lg font-bold lap-time tabular">
                      {formatLapMs(l.total_ms)}
                    </span>
                  </Link>
                  {/* シェアボタンはリンク外に逃がしてクリックがバブリングしないようにする */}
                  <div className="border-t border-zinc-100 px-4 py-1.5">
                    <ShareButtons
                      text={lapText}
                      url={lapUrl}
                      size="sm"
                      showCopy={false}
                    />
                  </div>
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
