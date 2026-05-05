/**
 * 法的文書ページ用の共通レイアウト
 * Tailwind の typography プラグインがなくても見られる素朴な体裁にする。
 */
export function LegalLayout({
  title,
  effectiveDate,
  children
}: {
  title: string;
  effectiveDate: string;
  children: React.ReactNode;
}) {
  return (
    <article className="mx-auto max-w-3xl space-y-6">
      <header className="border-b border-zinc-200 pb-4">
        <h1 className="text-2xl font-bold text-zinc-900 sm:text-3xl">{title}</h1>
        <p className="mt-2 text-xs text-zinc-500">最終更新: {effectiveDate}</p>
      </header>
      <div className="space-y-6 text-sm leading-relaxed text-zinc-700 [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-zinc-900 [&_h3]:mt-4 [&_h3]:font-bold [&_h3]:text-zinc-900 [&_p]:mt-2 [&_ol]:mt-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mt-1 [&_strong]:text-zinc-900 [&_table]:mt-3 [&_table]:w-full [&_table]:border-collapse [&_th]:border [&_th]:border-zinc-200 [&_th]:bg-zinc-50 [&_th]:p-2 [&_th]:text-left [&_th]:text-xs [&_td]:border [&_td]:border-zinc-200 [&_td]:p-2 [&_td]:text-sm">
        {children}
      </div>
    </article>
  );
}
