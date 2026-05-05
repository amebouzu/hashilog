"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/auth/callback?next=/reset-password`
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setInfo(
      "パスワード再設定用のリンクをメールでお送りしました。メール内のリンクからパスワードを再設定してください。"
    );
  }

  return (
    <div className="mx-auto max-w-md py-6">
      <h1 className="mb-2 text-2xl font-bold text-zinc-900">パスワードを忘れた方</h1>
      <p className="mb-6 text-sm text-zinc-500">
        ご登録済みのメールアドレスを入力してください。再設定用のリンクをお送りします。
      </p>
      {info && (
        <div className="mb-4 rounded-lg border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-900">
          {info}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm text-zinc-700">メールアドレス</span>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus:border-racing-red focus:outline-none focus:ring-2 focus:ring-red-100"
          />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-racing-red py-2.5 font-bold text-white hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? "送信中…" : "再設定メールを送る"}
        </button>
      </form>
      <p className="mt-4 text-sm text-zinc-500">
        <Link href="/login" className="text-racing-red hover:underline">
          ログイン画面に戻る
        </Link>
      </p>
    </div>
  );
}
