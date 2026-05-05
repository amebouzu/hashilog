import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateContactStatus } from "@/app/actions/admin";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  new: "新規",
  in_progress: "対応中",
  resolved: "対応済",
  spam: "スパム"
};

const CATEGORY_LABEL: Record<string, string> = {
  general: "一般",
  partnership: "提携希望",
  sponsor: "スポンサー",
  bug: "不具合",
  feature: "機能要望",
  account: "アカウント",
  other: "その他"
};

const STATUS_BADGE: Record<string, string> = {
  new: "bg-red-100 text-red-800",
  in_progress: "bg-amber-100 text-amber-800",
  resolved: "bg-emerald-100 text-emerald-800",
  spam: "bg-zinc-200 text-zinc-600"
};

export default async function AdminContactsPage({
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
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.is_admin) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <h1 className="text-lg font-bold text-red-900">権限がありません</h1>
      </div>
    );
  }

  const filter = searchParams.status ?? "new";
  let q = supabase
    .from("contacts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);
  if (filter !== "all") q = q.eq("status", filter);
  const { data: contacts } = await q;

  const counts = await Promise.all(
    ["new", "in_progress", "resolved", "spam"].map(async (s) => {
      const { count } = await supabase
        .from("contacts")
        .select("id", { count: "exact", head: true })
        .eq("status", s);
      return [s, count ?? 0] as const;
    })
  );
  const countMap = Object.fromEntries(counts) as Record<string, number>;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">
          ADMIN
        </p>
        <h1 className="text-2xl font-bold text-zinc-900">お問い合わせ受信箱</h1>
      </div>

      <nav className="flex flex-wrap gap-2">
        {(["new", "in_progress", "resolved", "spam", "all"] as const).map((s) => {
          const active = filter === s;
          return (
            <Link
              key={s}
              href={`/admin/contacts?status=${s}`}
              className={`rounded-full border px-3 py-1 text-xs font-medium ${
                active
                  ? "border-zinc-900 bg-zinc-900 text-white"
                  : "border-zinc-300 text-zinc-700 hover:bg-zinc-50"
              }`}
            >
              {s === "all" ? "全て" : STATUS_LABEL[s]}
              {s !== "all" && (
                <span className="ml-1 text-[10px] opacity-70">
                  {countMap[s] ?? 0}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {contacts && contacts.length > 0 ? (
        <div className="space-y-3">
          {contacts.map((c) => (
            <details
              key={c.id}
              className="rounded-lg border border-zinc-200 bg-white"
            >
              <summary className="cursor-pointer list-none p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      STATUS_BADGE[c.status]
                    }`}
                  >
                    {STATUS_LABEL[c.status]}
                  </span>
                  <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[10px] text-zinc-600">
                    {CATEGORY_LABEL[c.category] ?? c.category}
                  </span>
                  <span className="text-sm font-bold text-zinc-900">
                    {c.subject}
                  </span>
                  <span className="ml-auto text-xs text-zinc-500">
                    {new Date(c.created_at).toLocaleString("ja-JP")}
                  </span>
                </div>
                <p className="mt-1 text-xs text-zinc-500">
                  {c.name} &lt;{c.email}&gt;
                </p>
              </summary>
              <div className="space-y-3 border-t border-zinc-200 p-4">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    本文
                  </h3>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-800">
                    {c.message}
                  </p>
                </div>
                {c.internal_notes && (
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      内部メモ
                    </h3>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-700">
                      {c.internal_notes}
                    </p>
                  </div>
                )}

                <form
                  action={updateContactStatus}
                  className="space-y-2 border-t border-zinc-200 pt-3"
                >
                  <input type="hidden" name="id" value={c.id} />
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="text-zinc-500">ステータス変更:</span>
                    {(["new", "in_progress", "resolved", "spam"] as const).map(
                      (s) => (
                        <button
                          key={s}
                          type="submit"
                          name="status"
                          value={s}
                          disabled={c.status === s}
                          className="rounded border border-zinc-300 px-2 py-1 text-zinc-700 hover:bg-zinc-50 disabled:opacity-40"
                        >
                          {STATUS_LABEL[s]}
                        </button>
                      )
                    )}
                  </div>
                  <textarea
                    name="notes"
                    defaultValue={c.internal_notes ?? ""}
                    rows={2}
                    placeholder="内部メモ (任意)"
                    className="w-full rounded border border-zinc-300 bg-white p-2 text-xs"
                  />
                  <a
                    href={`mailto:${c.email}?subject=${encodeURIComponent("Re: " + c.subject)}`}
                    className="inline-block rounded border border-zinc-300 px-3 py-1 text-xs text-zinc-700 hover:bg-zinc-50"
                  >
                    メール返信を作成 →
                  </a>
                </form>
              </div>
            </details>
          ))}
        </div>
      ) : (
        <p className="rounded-lg border border-dashed border-zinc-300 p-10 text-center text-sm text-zinc-500">
          このステータスのお問い合わせはありません。
        </p>
      )}
    </div>
  );
}
