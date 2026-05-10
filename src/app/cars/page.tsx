import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Car, Profile } from "@/lib/types";
import { ShareButtons } from "@/components/ShareButtons";
import { ProfileHeader } from "@/components/ProfileHeader";

export const dynamic = "force-dynamic";

export default async function MyCarsPage({
  searchParams
}: {
  searchParams: { profile?: string };
}) {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: cars }, { data: profile }, { count: lapCount }] =
    await Promise.all([
      supabase
        .from("cars")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      supabase
        .from("lap_times")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
    ]);

  const username = profile?.username ?? "";
  const carCount = cars?.length ?? 0;

  return (
    <div className="space-y-5">
      {profile && (
        <ProfileHeader
          profile={profile as Profile}
          stats={{ cars: carCount, laps: lapCount ?? 0 }}
          isMyself
        />
      )}

      {searchParams.profile === "updated" && (
        <p className="rounded-lg border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-900">
          プロフィールを保存しました。
        </p>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-zinc-900">愛車一覧</h2>
        <Link
          href="/cars/new"
          className="rounded bg-racing-red px-3 py-2 text-sm font-bold text-white hover:bg-red-700"
        >
          + 愛車を登録
        </Link>
      </div>
      {cars && cars.length > 0 ? (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(cars as Car[]).map((c) => (
            <li
              key={c.id}
              className="overflow-hidden rounded-lg border border-zinc-200 bg-white transition hover:border-racing-red"
            >
              <Link href={`/cars/${c.id}`} className="flex">
                {/* 左: 4:3 のカバー画像 (車は横長なので正方形より自然に収まる) */}
                <div className="aspect-[4/3] w-32 flex-shrink-0 overflow-hidden bg-zinc-100 sm:w-36">
                  {c.cover_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={c.cover_url}
                      alt={`${c.maker} ${c.model}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[10px] text-zinc-400">
                      No image
                    </div>
                  )}
                </div>
                {/* 右: テキスト情報 (シェアボタンとは別エリアに移したので余白なし) */}
                <div className="min-w-0 flex-1 p-3">
                  <p className="text-xs text-zinc-500">
                    {c.maker} {c.year ? `· ${c.year}` : ""}
                  </p>
                  <p className="truncate text-base font-bold text-zinc-900">
                    {c.name}
                  </p>
                  <p className="truncate text-sm text-zinc-700">{c.model}</p>
                  <p className="mt-1.5 text-xs text-zinc-500">
                    {c.power_ps ? `${c.power_ps}PS` : ""}{" "}
                    {c.weight_kg ? `· ${c.weight_kg}kg` : ""}
                  </p>
                </div>
              </Link>
              {/* 下部: シェアボタン (リンクの外に置いてバブリングを防ぐ。
                   車両名と被らないよう独立したフッター行に分離) */}
              <div className="border-t border-zinc-100 px-3 py-2">
                <ShareButtons
                  text={`🏎️ @${username} の愛車「${c.name}」(${c.maker} ${c.model}) - 走ログ`}
                  url={`/cars/${c.id}`}
                  size="sm"
                  showCopy={false}
                />
              </div>
            </li>
          ))}
          <Link
            href="/cars/new"
            className="rounded-lg border-2 border-dashed border-zinc-300 p-4 text-center transition hover:border-racing-red"
          >
            <p className="mt-6 text-zinc-500">+ 新しい愛車を追加</p>
            <p className="mt-1 text-xs text-zinc-400">
              改造内容も登録できます
            </p>
          </Link>
        </ul>
      ) : (
        <p className="rounded-lg border border-dashed border-zinc-300 p-10 text-center text-sm text-zinc-500">
          まだ愛車が登録されていません。最初の一台を登録しましょう。
        </p>
      )}
    </div>
  );
}
