import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { submitContactAction } from "@/app/actions/contact";

export const metadata: Metadata = {
  title: "お問い合わせ",
  description: "走ログへのご質問・ご要望・不具合のご報告はこちらから。"
};

export const dynamic = "force-dynamic";

const CATEGORY_OPTIONS: { value: string; label: string }[] = [
  { value: "general", label: "一般的なお問い合わせ" },
  { value: "partnership", label: "サーキット運営者 (提携希望)" },
  { value: "sponsor", label: "スポンサー・広告掲載のご相談" },
  { value: "bug", label: "不具合・バグの報告" },
  { value: "feature", label: "機能リクエスト" },
  { value: "account", label: "アカウント・課金関連" },
  { value: "other", label: "その他" }
];

export default async function ContactPage({
  searchParams
}: {
  searchParams: { status?: string; category?: string };
}) {
  // ログイン中なら名前・メールを初期値に
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  let defaultName = "";
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name, username")
      .eq("id", user.id)
      .maybeSingle();
    defaultName = profile?.display_name ?? profile?.username ?? "";
  }

  const status = searchParams.status;
  const defaultCategory = searchParams.category ?? "";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">お問い合わせ</h1>
        <p className="mt-2 text-sm text-zinc-600">
          ご質問・ご要望・不具合のご報告はこちらのフォームからお送りください。
          <br />
          通常 2〜3 営業日以内に返信いたします。
        </p>
      </div>

      {status === "success" && (
        <Notice type="success">
          お問い合わせを受け付けました。返信まで今しばらくお待ちください。
        </Notice>
      )}
      {status === "missing" && (
        <Notice type="warn">必須項目をご入力ください。</Notice>
      )}
      {status === "consent" && (
        <Notice type="warn">個人情報の取扱いについてご同意ください。</Notice>
      )}
      {status === "invalid_email" && (
        <Notice type="warn">メールアドレスの形式が正しくありません。</Notice>
      )}
      {status === "invalid_category" && (
        <Notice type="warn">お問い合わせ種別を選択してください。</Notice>
      )}
      {status === "too_long" && (
        <Notice type="warn">入力内容が長すぎます。文字数をご確認ください。</Notice>
      )}
      {status === "error" && (
        <Notice type="warn">
          送信中にエラーが発生しました。時間をおいて再度お試しください。
        </Notice>
      )}

      <form
        action={submitContactAction}
        className="space-y-4 rounded-lg border border-zinc-200 bg-white p-6"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="お名前" required>
            <input
              required
              name="name"
              defaultValue={defaultName}
              maxLength={100}
              placeholder="走太郎"
              className="input"
            />
          </Field>
          <Field label="メールアドレス" required>
            <input
              required
              type="email"
              name="email"
              defaultValue={user?.email ?? ""}
              placeholder="you@example.com"
              className="input"
            />
          </Field>
        </div>

        <Field label="お問い合わせ種別" required>
          <select
            required
            name="category"
            defaultValue={defaultCategory}
            className="input"
          >
            <option value="">選択してください</option>
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="件名" required>
          <input
            required
            name="subject"
            maxLength={200}
            placeholder="例: 富士スピードウェイの走行会告知について"
            className="input"
          />
        </Field>

        <Field label="お問い合わせ内容" required>
          <textarea
            required
            name="message"
            rows={6}
            maxLength={5000}
            placeholder="できるだけ詳細にご記入ください。&#10;バグ報告の場合は、利用環境 (ブラウザ・OS) と再現手順も併せてお知らせいただけると助かります。"
            className="input"
          />
        </Field>

        <label className="flex items-start gap-2 text-xs text-zinc-600">
          <input type="checkbox" required name="agreed" className="mt-0.5" />
          <span>
            個人情報の取扱いについて同意します。お送りいただいた内容は、お問い合わせへの返信および機能改善の目的でのみ使用します。
          </span>
        </label>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="submit"
            className="rounded bg-racing-red px-5 py-2.5 font-bold text-white hover:bg-red-700"
          >
            送信する
          </button>
          <span className="text-xs text-zinc-500">通常 2〜3 営業日以内に返信</span>
        </div>
      </form>

      <div className="rounded-lg border border-zinc-200 bg-white p-6">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-zinc-500">
          直接のご連絡
        </h2>
        <p className="text-sm text-zinc-700">
          サーキット提携・取材・メディア・セキュリティ報告などのご連絡は下記までお願いします。
        </p>
        <p className="mt-2 text-sm">
          <a
            className="font-bold text-racing-red hover:underline"
            href="mailto:hashilog2024@gmail.com"
          >
            hashilog2024@gmail.com
          </a>
        </p>
        <p className="mt-2 text-xs text-zinc-500">
          通常 2〜3 営業日以内に返信いたします。
        </p>
      </div>

      <p className="text-xs text-zinc-500">
        ※ 個別のドライビング相談・走行アドバイス等にはお答えいたしかねます。コミュニティ機能の活用をご検討ください。
      </p>

      <style>{`
        .input {
          width: 100%;
          background: #ffffff;
          border: 1px solid #d4d4d8;
          border-radius: 6px;
          padding: 8px 10px;
          color: #18181b;
          font-size: 14px;
        }
        .input:focus {
          outline: none;
          border-color: #e10600;
          box-shadow: 0 0 0 3px rgba(225, 6, 0, 0.1);
        }
      `}</style>
    </div>
  );
}

function Field({
  label,
  required,
  children
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm text-zinc-700">
        {label} {required && <span className="text-red-600">*</span>}
      </span>
      {children}
    </label>
  );
}

function Notice({
  type,
  children
}: {
  type: "success" | "warn";
  children: React.ReactNode;
}) {
  const cls =
    type === "success"
      ? "border-emerald-300 bg-emerald-50 text-emerald-900"
      : "border-amber-300 bg-amber-50 text-amber-900";
  return (
    <div className={`rounded-lg border p-3 text-sm ${cls}`}>{children}</div>
  );
}
