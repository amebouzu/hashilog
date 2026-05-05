import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { deleteAccountAction } from "@/app/actions/account";

export const dynamic = "force-dynamic";

export default async function AccountSettingsPage({
  searchParams
}: {
  searchParams: { status?: string };
}) {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, display_name")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900">アカウント設定</h1>

      <section className="rounded-lg border border-zinc-200 bg-white p-5 space-y-3">
        <h2 className="text-lg font-bold text-zinc-900">基本情報</h2>
        <dl className="space-y-2 text-sm">
          <Row label="メールアドレス">{user.email}</Row>
          <Row label="ユーザー名">@{profile?.username}</Row>
          <Row label="表示名">{profile?.display_name ?? "-"}</Row>
        </dl>
        <div className="flex flex-wrap gap-2 pt-2">
          <Link
            href="/settings/profile"
            className="rounded border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50"
          >
            プロフィール編集
          </Link>
          <Link
            href="/forgot-password"
            className="rounded border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50"
          >
            パスワード変更
          </Link>
        </div>
      </section>

      {/* ===== 危険ゾーン ===== */}
      <section className="rounded-lg border-2 border-red-200 bg-red-50/40 p-5 space-y-3">
        <h2 className="text-lg font-bold text-red-900">アカウント削除</h2>
        <p className="text-sm text-zinc-700">
          アカウントを削除すると、以下の情報がすべて完全に削除され、復元できません。
        </p>
        <ul className="list-disc pl-5 text-sm text-zinc-700">
          <li>プロフィール情報 (自己紹介・SNS・写真)</li>
          <li>登録した愛車・写真・改造内容</li>
          <li>投稿したラップタイム・写真エビデンス</li>
          <li>有料プランの契約 (解約処理は別途行ってください)</li>
        </ul>
        <p className="text-xs text-zinc-500">
          法令に基づく保存義務がある場合を除き、すぐに削除されます。
        </p>

        {searchParams.status === "mismatch" && (
          <p className="rounded border border-amber-300 bg-amber-50 p-2 text-sm text-amber-900">
            確認用のユーザー名が一致しませんでした。
          </p>
        )}
        {searchParams.status === "error" && (
          <p className="rounded border border-red-300 bg-red-50 p-2 text-sm text-red-900">
            削除処理でエラーが発生しました。お問い合わせください。
          </p>
        )}

        <details className="rounded border border-red-200 bg-white p-4">
          <summary className="cursor-pointer text-sm font-bold text-red-700">
            アカウントを削除する
          </summary>
          <form action={deleteAccountAction} className="mt-4 space-y-3">
            <label className="block">
              <span className="mb-1 block text-xs text-zinc-700">
                確認のため、ユーザー名{" "}
                <code className="rounded bg-zinc-100 px-1 font-mono text-xs">
                  {profile?.username}
                </code>{" "}
                を入力してください
              </span>
              <input
                required
                name="confirmation"
                placeholder={profile?.username ?? ""}
                className="w-full rounded border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-zinc-700">
                よろしければ理由を教えてください (任意)
              </span>
              <textarea
                name="reason"
                rows={3}
                maxLength={500}
                className="w-full rounded border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900"
                placeholder="サービス改善の参考にさせていただきます。"
              />
            </label>
            <button
              type="submit"
              className="rounded bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700"
            >
              アカウントを完全に削除する
            </button>
          </form>
        </details>
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
    <div className="flex items-baseline gap-3">
      <dt className="w-32 flex-none text-xs uppercase tracking-wider text-zinc-500">
        {label}
      </dt>
      <dd className="text-zinc-800">{children}</dd>
    </div>
  );
}
