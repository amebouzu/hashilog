import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "走ログとは",
  description:
    "走ログは、サーキット走行を楽しむすべてのドライバーのためのタイム共有サービスです。愛車の改造内容・タイヤ・コンディションを一緒に記録できます。"
};

const FEATURES = [
  {
    icon: "🏎️",
    title: "愛車のスペックシート",
    desc: "足回り・エンジン・駆動系・ブレーキ・外装・内装の6カテゴリで改造内容を詳細に記録。"
  },
  {
    icon: "⏱️",
    title: "タイム記録",
    desc: "総合タイム + セクター + 最高速 + 天候 + 路面 + 気温/路温まで、走行条件を網羅的に保存。"
  },
  {
    icon: "📷",
    title: "写真エビデンス",
    desc: "タイミングモニター・車載動画のスクリーンショットを複数枚アップロード可能。信頼性のあるリザルトに。"
  },
  {
    icon: "🏆",
    title: "フェアなランキング",
    desc: "サーキット・タイヤ銘柄・車種・メーカーで絞り込み。同じ条件のライバルとフェアに比較。"
  },
  {
    icon: "🏁",
    title: "国内サーキット網羅",
    desc: "富士・鈴鹿・もてぎなどの国際サーキットからミニサーキットまで、日本の主要コースを網羅。"
  },
  {
    icon: "📣",
    title: "SNSシェア",
    desc: "X / Facebook / Instagram / Threads / LINE にワンクリックでベストタイムや愛車紹介をシェア。"
  }
];

const USE_CASES = [
  {
    title: "📅 走行会の前後",
    desc: "走行会前に同じサーキット・同じ車種のベストタイムを参考に。走り終わったらすぐタイム投稿でベスト更新を共有。"
  },
  {
    title: "🛠 セットアップ変更時",
    desc: "タイヤを履き替えた・足回りを調整した。改造内容と一緒にタイムを残せば、変更前後の効果が一目瞭然。"
  },
  {
    title: "🎯 タイムアタック競技",
    desc: "筑波スーパーバトルなどの競技に向けて、シーズンを通じて自分の成長を記録。SNSで盛り上がりを発信。"
  }
];

export default function AboutPage() {
  return (
    <div className="space-y-10">
      <section className="hero rounded-xl p-5 sm:p-12">
        <p className="text-xs font-semibold uppercase tracking-widest text-racing-red">
          ABOUT
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-zinc-900 sm:text-4xl">
          走ログとは
        </h1>
        <p className="mt-4 max-w-2xl leading-relaxed text-zinc-700">
          走ログは、サーキット走行を楽しむすべてのドライバーのためのタイム共有サービスです。
          <br />
          愛車の改造内容・使用タイヤ・走行コンディションを一緒に記録することで、
          自分の上達を可視化し、同じ条件で走るライバルと比較できる環境を提供します。
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-zinc-200 bg-white p-6">
          <h2 className="mb-3 text-lg font-bold text-zinc-900">私たちの想い</h2>
          <p className="text-sm leading-relaxed text-zinc-700">
            「あの人の○○秒はどんな車・どんなタイヤで出したのか?」
            <br />
            サーキットを走るドライバーが必ず一度は気になる疑問。SNSや動画ではバラバラに散らばっているこの情報を、一箇所にまとめて検索可能にすることが走ログの目的です。
            <br />
            <br />
            タイムだけでなく、その背景にある
            <strong>セットアップの歴史</strong>
            を共有することで、走り込み派のドライバーが「次の一手」を見つけるヒントになる。そんなコミュニティを目指しています。
          </p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-6">
          <h2 className="mb-3 text-lg font-bold text-zinc-900">
            こんな方におすすめ
          </h2>
          <ul className="space-y-2 text-sm text-zinc-700">
            {[
              "月1回以上サーキットを走るアマチュアドライバー",
              "愛車のセットアップを記録・共有したい方",
              "走行会・タイムアタック競技に出場している方",
              "同じ車種・同じタイヤでベストタイムを比較したい方",
              "これからサーキットデビューする初心者の方"
            ].map((t) => (
              <li key={t} className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 flex-none rounded-full bg-racing-red" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section>
        <div className="mb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
            FEATURES
          </p>
          <h2 className="mt-1 text-2xl font-bold text-zinc-900">主な機能</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-zinc-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-racing-red"
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
            USE CASE
          </p>
          <h2 className="mt-1 text-2xl font-bold text-zinc-900">利用シーン</h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {USE_CASES.map((u) => (
            <div key={u.title}>
              <h3 className="font-bold text-zinc-900">{u.title}</h3>
              <p className="mt-2 text-sm text-zinc-600">{u.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="mb-3 text-lg font-bold text-zinc-900">
          サーキット運営者の方へ
        </h2>
        <p className="text-sm leading-relaxed text-zinc-700">
          走ログでは、各サーキットの公式運営者の方に
          <strong> 自施設ページの編集権限 </strong>
          を発行しています。
          <br />
          走行会・スポーツ走行の告知、料金変更のお知らせ、レースイベントの周知などを、走ログユーザーに直接届けることができます。
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/contact?category=partnership"
            className="rounded bg-amber-600 px-4 py-2 text-sm font-bold text-white hover:bg-amber-700"
          >
            提携について問い合わせる
          </Link>
          <Link
            href="/circuit-login"
            className="rounded border border-zinc-300 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
          >
            運営者ログイン
          </Link>
        </div>
      </section>

      <section>
        <div className="mb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
            GUIDE
          </p>
          <h2 className="mt-1 text-2xl font-bold text-zinc-900">
            これから始める方へ
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Link
            href="/guide/intro"
            className="rounded-xl border border-zinc-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-racing-red"
          >
            <h3 className="font-bold text-zinc-900">サーキット走行 入門</h3>
            <p className="mt-2 text-sm text-zinc-600">
              スポーツ走行と走行会の違い、参加準備、当日の流れ、初心者がやりがちな失敗、上達のコツまで。
            </p>
            <p className="mt-3 text-xs font-semibold text-racing-red">
              ガイドを読む →
            </p>
          </Link>
          <Link
            href="/guide/tires"
            className="rounded-xl border border-zinc-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-racing-red"
          >
            <h3 className="font-bold text-zinc-900">タイヤ選びガイド</h3>
            <p className="mt-2 text-sm text-zinc-600">
              ストリートラジアル / ハイグリップ / セミスリック / Sタイヤの違いと、レベル別おすすめ銘柄。
            </p>
            <p className="mt-3 text-xs font-semibold text-racing-red">
              ガイドを読む →
            </p>
          </Link>
          <Link
            href="/help"
            className="rounded-xl border border-zinc-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-racing-red"
          >
            <h3 className="font-bold text-zinc-900">よくある質問 (FAQ)</h3>
            <p className="mt-2 text-sm text-zinc-600">
              走ログの使い方、タイム投稿、愛車登録、ランキング、トラブル対応など 25 問。
            </p>
            <p className="mt-3 text-xs font-semibold text-racing-red">
              FAQ を見る →
            </p>
          </Link>
        </div>
      </section>

      <section className="hero rounded-xl p-5 text-center sm:p-8">
        <h2 className="text-2xl font-bold text-zinc-900">
          あなたの走りを、データに残そう
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
            href="/ranking"
            className="rounded border border-zinc-300 px-5 py-2.5 font-bold text-zinc-700 hover:bg-zinc-50"
          >
            ランキングを見る
          </Link>
        </div>
      </section>
    </div>
  );
}
