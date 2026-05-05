"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    if (password !== confirm) {
      setError("パスワードが一致しません。");
      return;
    }
    if (password.length < 8) {
      setError("パスワードは8文字以上にしてください。");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setInfo("パスワードを変更しました。再ログインしてください。");
    setTimeout(() => router.push("/login"), 1500);
  }

  return (
    <div className="mx-auto max-w-md py-6">
      <h1 className="mb-2 text-2xl font-bold text-zinc-900">
        新しいパスワードを設定
      </h1>
      <p className="mb-6 text-sm text-zinc-500">
        新しいパスワードを2回入力してください。
      </p>
      {info && (
        <div className="mb-4 rounded-lg border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-900">
          {info}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm text-zinc-700">
            新しいパスワード <span className="text-zinc-400">(8文字以上)</span>
          </span>
          <input
            required
            type="password"
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus:border-racing-red focus:outline-none focus:ring-2 focus:ring-red-100"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm text-zinc-700">
            新しいパスワード (確認)
          </span>
          <input
            required
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full rounded border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus:border-racing-red focus:outline-none focus:ring-2 focus:ring-red-100"
          />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-racing-red py-2.5 font-bold text-white hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? "変更中…" : "パスワードを変更"}
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
