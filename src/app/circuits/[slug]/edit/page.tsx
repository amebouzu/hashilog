import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  EVENT_TYPE_LABEL,
  type Circuit,
  type CircuitEvent
} from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function CircuitEditPage({
  params
}: {
  params: { slug: string };
}) {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect(`/circuit-login`);

  const { data: circuit } = await supabase
    .from("circuits")
    .select("*")
    .eq("slug", params.slug)
    .maybeSingle();
  if (!circuit) notFound();

  // 権限チェック
  const { data: staffRow } = await supabase
    .from("circuit_staff")
    .select("role")
    .eq("user_id", user.id)
    .eq("circuit_id", circuit.id)
    .maybeSingle();
  if (!staffRow) {
    return (
      <div className="rounded-lg border border-amber-300 bg-amber-50 p-6">
        <h1 className="text-lg font-bold text-amber-900">権限がありません</h1>
        <p className="mt-2 text-sm text-zinc-700">
          このサーキットの編集権限を持っていません。走ログ運営にお問い合わせください。
        </p>
        <Link
          href={`/circuits/${params.slug}`}
          className="mt-4 inline-block text-sm text-racing-red hover:underline"
        >
          ← 公開ページに戻る
        </Link>
      </div>
    );
  }

  const c = circuit as Circuit;

  const { data: events } = await supabase
    .from("circuit_events")
    .select("*")
    .eq("circuit_id", c.id)
    .order("starts_at", { ascending: true, nullsFirst: false })
    .limit(50);

  const evList = (events ?? []) as CircuitEvent[];

  return (
    <div className="space-y-6">
      {/* Staff banner */}
      <div
        className="rounded-lg border p-4"
        style={{
          background: "linear-gradient(135deg, #fef3c7 0%, #fef9c3 100%)",
          borderColor: "#fcd34d"
        }}
      >
        <p className="text-xs font-semibold uppercase tracking-wider text-amber-800">
          CIRCUIT STAFF MODE
        </p>
        <p className="mt-1 text-sm text-zinc-800">
          運営者として編集中です ({staffRow.role}権限)
        </p>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-xs text-zinc-500">編集中</p>
          <h1 className="text-3xl font-bold text-zinc-900">{c.name}</h1>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/circuits/${c.slug}`}
            className="rounded border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50"
          >
            公開ページを表示
          </Link>
        </div>
      </div>

      {/* TODO: useTransition + server action でフォーム送信 */}
      <section className="rounded-lg border border-zinc-200 bg-white p-5">
        <h2 className="mb-3 text-lg font-bold text-zinc-900">基本情報</h2>
        <p className="mb-4 text-xs text-zinc-500">
          編集フォームは実装中です。Server Actions と組み合わせてフィールドを更新します。
        </p>
        <dl className="space-y-3 text-sm">
          <Row label="サーキット紹介文">{c.description ?? "未設定"}</Row>
          <Row label="特徴">
            {c.features && c.features.length > 0
              ? c.features.join(" / ")
              : "未設定"}
          </Row>
          <Row label="名物コーナー">
            {c.famous_corners && c.famous_corners.length > 0
              ? c.famous_corners.join(" / ")
              : "未設定"}
          </Row>
          <Row label="公式サイトURL">
            {c.official_url ? (
              <a
                href={c.official_url}
                target="_blank"
                rel="noreferrer"
                className="text-racing-red hover:underline"
              >
                {c.official_url}
              </a>
            ) : (
              "未設定"
            )}
          </Row>
          <Row label="公開状態">
            {c.is_published ? "公開中" : "非公開"}
          </Row>
        </dl>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-zinc-900">
            イベント・走行会の告知
          </h2>
          <button
            disabled
            className="rounded bg-amber-600 px-3 py-1.5 text-sm font-bold text-white opacity-50"
            title="実装中"
          >
            + 新規追加
          </button>
        </div>
        {evList.length > 0 ? (
          <div className="space-y-2">
            {evList.map((e) => (
              <div
                key={e.id}
                className="flex items-start justify-between gap-3 rounded-lg border border-zinc-200 p-3"
              >
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-bold uppercase">
                      {EVENT_TYPE_LABEL[e.event_type]}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {e.date_label ??
                        (e.starts_at
                          ? new Date(e.starts_at).toLocaleDateString("ja-JP")
                          : "—")}
                    </span>
                    {!e.is_published && (
                      <span className="text-xs text-zinc-400">(非公開)</span>
                    )}
                  </div>
                  <p className="mt-1 text-sm font-bold text-zinc-900">
                    {e.title}
                  </p>
                  {e.body && (
                    <p className="mt-1 text-xs text-zinc-600">{e.body}</p>
                  )}
                </div>
                <div className="flex flex-none gap-1">
                  <button
                    disabled
                    className="rounded border border-zinc-300 px-2 py-1 text-xs text-zinc-600 opacity-50"
                  >
                    編集
                  </button>
                  <button
                    disabled
                    className="rounded border border-zinc-300 px-2 py-1 text-xs text-red-600 opacity-50"
                  >
                    削除
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-lg border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500">
            まだ告知が登録されていません
          </p>
        )}
      </section>
    </div>
  );
}

function Row({
  label,
  children
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wider text-zinc-500">
        {label}
      </dt>
      <dd className="mt-1 whitespace-pre-wrap text-zinc-800">{children}</dd>
    </div>
  );
}
