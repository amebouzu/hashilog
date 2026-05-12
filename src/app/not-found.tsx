import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ページが見つかりません"
};

/**
 * カスタム 404 ページ.
 * Next.js の組み込み英語 404 を走ログのブランドに合わせて差し替え.
 */
export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center justify-center px-4 py-20 text-center">
      {/* 大きな 404 数字 (赤、レーシングフォント感のあるモノスペース) */}
      <p className="font-mono text-7xl font-black tabular sm:text-9xl lap-time">
        404
      </p>

      <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-zinc-500">
        Page Not Found
      </p>

      <h1 className="mt-6 text-2xl font-bold text-zinc-900 sm:text-3xl">
        お探しのページが見つかりません
      </h1>

      <p className="mt-4 max-w-md text-sm text-zinc-600">
        URL が変更されたか、削除された可能性があります。
        トップページから目的のページを探してみてください。
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="rounded bg-racing-red px-5 py-2 text-sm font-bold text-white hover:bg-red-700"
        >
          🏁 トップに戻る
        </Link>
        <Link
          href="/ranking"
          className="rounded border border-zinc-300 px-5 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
        >
          ランキングを見る
        </Link>
        <Link
          href="/circuits"
          className="rounded border border-zinc-300 px-5 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
        >
          サーキット一覧
        </Link>
      </div>

      <p className="mt-12 text-xs text-zinc-400">
        困ったときは{" "}
        <Link href="/contact" className="text-racing-red hover:underline">
          お問い合わせ
        </Link>{" "}
        からご連絡ください
      </p>
    </div>
  );
}
