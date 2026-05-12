/**
 * グローバルなローディング画面.
 * Next.js App Router がページ遷移時に Suspense 境界として自動表示する.
 * 走ログのブランド (レーシングレッド) に合わせたスケルトン UI.
 */
export default function Loading() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col items-center justify-center px-4 py-16">
      {/* 中央のローディングインジケータ */}
      <div className="relative h-16 w-16">
        {/* 外周の回転リング (レーシング感のあるストロボ風) */}
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-zinc-200 border-t-racing-red" />
        {/* 中央の小さな赤丸 (脈動) */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="h-3 w-3 animate-pulse rounded-full bg-racing-red" />
        </div>
      </div>

      <p className="mt-6 text-sm font-semibold uppercase tracking-widest text-zinc-500">
        Loading…
      </p>

      {/* スケルトン: 何かしらのコンテンツが来る雰囲気 */}
      <div className="mt-10 w-full max-w-2xl space-y-4">
        <div className="h-7 w-1/3 animate-pulse rounded bg-zinc-200" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-zinc-100" />
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="h-20 animate-pulse rounded-lg bg-zinc-100" />
          <div className="h-20 animate-pulse rounded-lg bg-zinc-100" />
        </div>
        <div className="h-20 animate-pulse rounded-lg bg-zinc-100" />
      </div>
    </div>
  );
}
