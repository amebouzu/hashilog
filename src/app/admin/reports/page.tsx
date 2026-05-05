import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateReportStatus } from "@/app/actions/admin";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  open: "未対応",
  in_review: "確認中",
  resolved: "対応済",
  dismissed: "却下"
};
const REASON_LABEL: Record<string, string> = {
  spam: "スパム",
  fake_time: "虚偽のタイム",
  inappropriate: "不適切な内容",
  impersonation: "なりすまし",
  copyright: "著作権侵害",
  harassment: "嫌がらせ",
  other: "その他"
};
const SUBJECT_LABEL: Record<string, string> = {
  lap_time: "ラップタイム",
  car: "愛車",
  profile: "プロフィール",
  circuit_event: "サーキットイベント",
  tire: "タイヤ銘柄",
  comment: "コメント"
};
const STATUS_BADGE: Record<string, string> = {
  open: "bg-red-100 text-red-800",
  in_review: "bg-amber-100 text-amber-800",
  resolved: "bg-emerald-100 text-emerald-800",
  dismissed: "bg-zinc-200 text-zinc-600"
};

function subjectLink(type: string, id: string): string | null {
  switch (type) {
    case "lap_time": return `/laps/${id}`;
    case "car":      return `/cars/${id}`;
    default:         return null;
  }
}

export default async function AdminReportsPage({
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

  const filter = searchParams.status ?? "open";
  let q = supabase
    .from("reports")
    .select(
      "*, reporter:profiles!reports_reporter_id_fkey(username, display_name)"
    )
    .order("created_at", { ascending: false })
    .limit(100);
  if (filter !== "all") q = q.eq("status", filter);
  const { data: reports } = await q;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">
          ADMIN
        </p>
        <h1 className="text-2xl font-bold text-zinc-900">通報一覧</h1>
      </div>

      <nav className="flex flex-wrap gap-2">
        {(["open", "in_review", "resolved", "dismissed", "all"] as const).map(
          (s) => {
            const active = filter === s;
            return (
              <Link
                key={s}
                href={`/admin/reports?status=${s}`}
                className={`rounded-full border px-3 py-1 text-xs font-medium ${
                  active
                    ? "border-zinc-900 bg-zinc-900 text-white"
                    : "border-zinc-300 text-zinc-700 hover:bg-zinc-50"
                }`}
              >
                {s === "all" ? "全て" : STATUS_LABEL[s]}
              </Link>
            );
          }
        )}
      </nav>

      {reports && reports.length > 0 ? (
        <div className="space-y-3">
          {(reports as any[]).map((r) => (
            <div
              key={r.id}
              className="rounded-lg border border-zinc-200 bg-white p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    STATUS_BADGE[r.status]
                  }`}
                >
                  {STATUS_LABEL[r.status]}
                </span>
                <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[10px] text-zinc-600">
                  {SUBJECT_LABEL[r.subject_type] ?? r.subject_type}
                </span>
                <span className="rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                  {REASON_LABEL[r.reason] ?? r.reason}
                </span>
                <span className="ml-auto text-xs text-zinc-500">
                  {new Date(r.created_at).toLocaleString("ja-JP")}
                </span>
              </div>
              <p className="mt-2 text-xs text-zinc-500">
                通報者:{" "}
                {r.reporter ? (
                  <Link
                    href={`/u/${r.reporter.username}`}
                    className="text-racing-red hover:underline"
                  >
                    @{r.reporter.username}
                  </Link>
                ) : (
                  "(削除済ユーザー)"
                )}
                {" · 対象ID: "}
                <code className="rounded bg-zinc-100 px-1 font-mono text-[10px]">
                  {r.subject_id}
                </code>
              </p>
              {r.detail && (
                <p className="mt-2 whitespace-pre-wrap rounded bg-zinc-50 p-2 text-sm text-zinc-800">
                  {r.detail}
                </p>
              )}
              {r.internal_notes && (
                <p className="mt-2 text-xs text-zinc-600">
                  内部メモ: {r.internal_notes}
                </p>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {subjectLink(r.subject_type, r.subject_id) && (
                  <Link
                    href={subjectLink(r.subject_type, r.subject_id)!}
                    target="_blank"
                    className="rounded border border-zinc-300 px-3 py-1 text-xs text-zinc-700 hover:bg-zinc-50"
                  >
                    対象を確認 →
                  </Link>
                )}
                <form
                  action={updateReportStatus}
                  className="flex flex-wrap gap-1"
                >
                  <input type="hidden" name="id" value={r.id} />
                  {(
                    ["open", "in_review", "resolved", "dismissed"] as const
                  ).map((s) => (
                    <button
                      key={s}
                      type="submit"
                      name="status"
                      value={s}
                      disabled={r.status === s}
                      className="rounded border border-zinc-300 px-2 py-1 text-xs text-zinc-700 hover:bg-zinc-50 disabled:opacity-40"
                    >
                      {STATUS_LABEL[s]}
                    </button>
                  ))}
                </form>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-lg border border-dashed border-zinc-300 p-10 text-center text-sm text-zinc-500">
          このステータスの通報はありません。
        </p>
      )}
    </div>
  );
}
