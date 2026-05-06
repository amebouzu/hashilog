"use client";

import { useTransition } from "react";

/**
 * ラップ削除ボタン。クリック時にブラウザ確認ダイアログを出してから
 * 親から渡された server action (引数なし) を呼ぶ。
 */
export function DeleteLapButton({
  action
}: {
  action: () => Promise<void>;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const ok = window.confirm(
          "このタイムを削除しますか?\n\n紐づくエビデンス写真も一緒に削除されます。\nこの操作は取り消せません。"
        );
        if (!ok) return;
        startTransition(() => {
          // Promise<void> をそのまま投げる (失敗時は Next.js が表示)
          action();
        });
      }}
    >
      <button
        type="submit"
        disabled={isPending}
        className="rounded border border-zinc-300 px-3 py-1 text-red-600 hover:border-red-300 hover:bg-red-50 disabled:opacity-50"
      >
        {isPending ? "削除中…" : "削除"}
      </button>
    </form>
  );
}
