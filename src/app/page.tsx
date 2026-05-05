import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "走ログ — サーキットタイム共有",
  description:
    "愛車のスペックも改造内容も、走った日の天候も。あなたのベストラップを一つのページに。"
};

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

export default function HomePage() {
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

