import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { LapSlider } from "@/components/LapSlider";
import { AdSenseSlot } from "@/components/AdSenseSlot";

export const metadata: Metadata = {
  title: "走ログ — サーキットタイム共有",
  description:
    "愛車のスペックも改造内容も、走った日の天候も。あなたのベストラップを一つのページに。"
};

export const dynamic = "force-dynamic";

const features = [
  {
    icon: "🏎️",
    title: "愛車を登録",
    desc: "足回り・エンジン・駆動系・ブレーキ・外装・内装まで。改造内容を6カテゴリで詳細に記録できます。"
  },
  {
    icon: "⏱️",
    title: "タイムを記録",
    desc: "総合タイム・セクタータイム・最高速、天候・路面・気温・路温。走行コンディションごと残せます。"
  },
  {
    icon: "📷",
    title: "写真でエビデンス",
    desc: "タイミングモニター・車載動画のスクショなどを複数枚アップ。信頼性のあるリザルトに。"
  },
  {
    icon: "🏆",
    title: "ランキングで比較",
    desc: "サーキット・タイヤ・車種・メーカーで絞り込み。同じ条件のライバルとフェアに競えます。"
  }
];

const steps = [
  { n: 1, title: "無料登録", desc: "メールとユーザー名だけで OK。30秒でアカウント作成。" },
  { n: 2, title: "愛車を登録", desc: "改造内容まで含めて、自分のスペックシートを作成。" },
  {
    n: 3,
    title: "タイムを投稿",
    desc: "走行後、写真と一緒にタイムをアップ。SNSにもワンクリックで共有。"
  }
];

export default async function HomePage() {
  const supabase = createClient();

  // 最新タイム投稿 (トップのスライダー用)
  const { data: latestLaps } = await supabase
    .from("lap_times")
    .select(
      `id, total_ms, driven_at,
       profiles(username),
       cars(maker, model),
       circuits(name)`
    )
    .order("created_at", { ascending: false })
    .limit(8);

  const adSlotHome = process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME;

  return (
    <div className="space-y-12">
      <section className="hero rounded-xl p-5 sm:p-12">
        <p className="text-xs font-semibold uppercase tracking-widest text-racing-red">
          CIRCUIT TIME · COMMUNITY
        </p>
        <h1 className="mt-2 text-2xl font-black tracking-tight text-zinc-900 sm:text-5xl">
          走ログ <span className="text-racing-red">/</span> サーキットタイム共有
        </h1>
        <p className="mt-4 max-w-2xl text-zinc-600">
          愛車のスペックも、改造内容も、走ったその日の天候も。
          あなたの「ベストラップ」を一つのページに。
          全国のドライバーと、信頼性のあるリザルトで競い合おう。
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/signup"
            className="rounded bg-racing-red px-5 py-2.5 font-bold text-white hover:bg-red-700"
          >
            無料ではじめる
          </Link>
          <Link
            href="/ranking"
            className="rounded border border-zinc-300 px-5 py-2.5 font-bold text-zinc-700 hover:bg-zinc-50"
          >
            ランキングを見る
          </Link>
        </div>
      </section>

      {/* 最新タイム投稿 (データがある時のみ表示) */}
      {latestLaps && latestLaps.length > 0 && (
        <section>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
                LATEST LAPS
              </p>
              <h2 className="mt-1 text-2xl font-bold text-zinc-900">
                最新のタイム投稿
              </h2>
            </div>
            <Link
              href="/ranking"
              className="text-sm text-racing-red hover:underline"
            >
              ランキングを見る →
            </Link>
          </div>
          <LapSlider laps={latestLaps as any} />
        </section>
      )}

      <section>
        <div className="mb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
            FEATURES
          </p>
          <h2 className="mt-1 text-2xl font-bold text-zinc-900">
            走ログでできること
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="feature-card rounded-xl border border-zinc-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-racing-red"
            >
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br from-red-100 to-red-50 text-2xl">
                {f.icon}
              </div>
              <h3 className="font-bold text-zinc-900">{f.title}</h3>
              <p className="mt-2 text-sm text-zinc-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-zinc-50 p-6 sm:p-10">
        <div className="mb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
            HOW IT WORKS
          </p>
          <h2 className="mt-1 text-2xl font-bold text-zinc-900">
            3ステップではじめられます
          </h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="flex gap-3">
              <div className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-racing-red text-sm font-bold text-white">
                {s.n}
              </div>
              <div>
                <h3 className="font-bold text-zinc-900">{s.title}</h3>
                <p className="mt-1 text-sm text-zinc-600">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* AdSense 広告枠 (環境変数 NEXT_PUBLIC_ADSENSE_SLOT_HOME 設定時のみ表示) */}
      {adSlotHome && (
        <section aria-label="広告">
          <AdSenseSlot slot={adSlotHome} />
        </section>
      )}

      {/* サーキット運営者・メーカー向け B2B 導線 */}
      <section className="overflow-hidden rounded-xl border border-zinc-200">
        <div className="grid sm:grid-cols-2">
          <div className="bg-zinc-900 p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-red-400">
              FOR CIRCUIT OPERATORS
            </p>
            <h3 className="mt-2 text-xl font-bold text-white">
              サーキット運営者の方へ
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-zinc-300">
              公式アカウントを無料で発行しています。自施設ページの編集、走行会・レース・お知らせの告知、来場ドライバーのタイム集計が可能です。
            </p>
            <Link
              href="/contact?category=partnership"
              className="mt-4 inline-block rounded bg-white px-4 py-2 text-sm font-bold text-zinc-900 hover:bg-zinc-100"
            >
              提携について相談する
            </Link>
          </div>
          <div className="bg-racing-red p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-red-200">
              FOR MANUFACTURERS
            </p>
            <h3 className="mt-2 text-xl font-bold text-white">
              タイヤ・パーツメーカーの方へ
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-red-100">
              「銘柄 × サーキット × 車両 × タイム」の実走行データが集まります。使用実績レポート、公式バッジ、新製品連動企画などをご提案できます。
            </p>
            <Link
              href="/contact?category=sponsor"
              className="mt-4 inline-block rounded bg-white px-4 py-2 text-sm font-bold text-racing-red hover:bg-red-50"
            >
              協業について相談する
            </Link>
          </div>
        </div>
      </section>

      <section className="hero rounded-xl p-5 text-center sm:p-8">
        <h2 className="text-2xl font-bold text-zinc-900">
          次のアタック、記録してみませんか?
        </h2>
        <p className="mt-2 text-sm text-zinc-600">
          無料で登録できます。クレジットカード不要。
        </p>
        <div className="mt-5 flex justify-center gap-3">
          <Link
            href="/signup"
            className="rounded bg-racing-red px-5 py-2.5 font-bold text-white hover:bg-red-700"
          >
            無料ではじめる
          </Link>
          <Link
            href="/login"
            className="rounded border border-zinc-300 px-5 py-2.5 font-bold text-zinc-700 hover:bg-zinc-50"
          >
            ログイン
          </Link>
        </div>
      </section>
    </div>
  );
}
