"use client";

import { useState, useTransition } from "react";
import { submitReportAction } from "@/app/actions/report";

type SubjectType =
  | "lap_time"
  | "car"
  | "profile"
  | "circuit_event"
  | "tire"
  | "comment";

const REASONS: { value: string; label: string }[] = [
  { value: "spam", label: "スパム・宣伝" },
  { value: "fake_time", label: "虚偽のタイム" },
  { value: "inappropriate", label: "不適切な内容" },
  { value: "impersonation", label: "なりすまし" },
  { value: "copyright", label: "著作権侵害" },
  { value: "harassment", label: "嫌がらせ" },
  { value: "other", label: "その他" }
];

/**
 * 通報ボタン (モーダル付き)
 *
 * ラップ詳細・愛車詳細・ユーザーページ等で使用:
 *   <ReportButton subjectType="lap_time" subjectId={lap.id} />
 */
export function ReportButton({
  subjectType,
  subjectId,
  size = "sm"
}: {
  subjectType: SubjectType;
  subjectId: string;
  size?: "sm" | "md";
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("spam");
  const [detail, setDetail] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function submit() {
    setError(null);
    start(async () => {
      try {
        const fd = new FormData();
        fd.set("subject_type", subjectType);
        fd.set("subject_id", subjectId);
        fd.set("reason", reason);
        fd.set("detail", detail);
        await submitReportAction(fd);
        setDone(true);
        setTimeout(() => {
          setOpen(false);
          setDone(false);
          setDetail("");
        }, 1500);
      } catch (e: any) {
        setError(e?.message ?? "送信に失敗しました");
      }
    });
  }

  const btnCls =
    size === "sm"
      ? "text-xs text-zinc-400 hover:text-red-600"
      : "rounded border border-zinc-300 px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-50 hover:text-red-600";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={btnCls}
        aria-label="通報する"
      >
        ⚠ 通報
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => !pending && setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-zinc-900">通報</h2>
            <p className="mt-1 text-xs text-zinc-500">
              不適切な内容を運営に報告します。匿名で送信されますが、運営者には通報者の情報が記録されます。
            </p>

            {done ? (
              <div className="mt-4 rounded border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-900">
                通報を受け付けました。内容を確認いたします。
              </div>
            ) : (
              <>
                <div className="mt-4 space-y-3">
                  <label className="block">
                    <span className="mb-1 block text-xs text-zinc-700">
                      理由
                    </span>
                    <select
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full rounded border border-zinc-300 bg-white px-3 py-2 text-sm"
                    >
                      {REASONS.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs text-zinc-700">
                      詳細 (任意)
                    </span>
                    <textarea
                      value={detail}
                      onChange={(e) => setDetail(e.target.value)}
                      rows={3}
                      maxLength={1000}
                      placeholder="詳しい状況をご記入ください。"
                      className="w-full rounded border border-zinc-300 bg-white px-3 py-2 text-sm"
                    />
                  </label>
                  {error && (
                    <p className="text-sm text-red-600">{error}</p>
                  )}
                </div>
                <div className="mt-5 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    disabled={pending}
                    className="rounded border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50"
                  >
                    キャンセル
                  </button>
                  <button
                    type="button"
                    onClick={submit}
                    disabled={pending}
                    className="rounded bg-red-600 px-3 py-1.5 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    {pending ? "送信中…" : "送信"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
