"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(
    params.get("error") ? "認証に失敗しました。" : null
  );
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    setLoading(false);
    if (error) return setError(error.message);
    router.push("/");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md py-6">
      <h1 className="mb-2 text-2xl font-bold text-zinc-900">ログイン</h1>
      <p className="mb-6 text-sm text-zinc-500">
        登録済みのアカウントでログイン。
      </p>
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
        <label className="block">
          <span className="mb-1 block text-sm text-zinc-700">パスワード</span>
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus:border-racing-red focus:outline-none focus:ring-2 focus:ring-red-100"
          />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-racing-red py-2.5 font-bold text-white hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? "ログイン中…" : "ログイン"}
        </button>
      </form>
      <p className="mt-2 text-sm">
        <Link href="/forgot-password" className="text-zinc-500 hover:text-racing-red hover:underline">
          パスワードをお忘れですか?
        </Link>
      </p>
      <p className="mt-4 text-sm text-zinc-500">
        アカウント未作成？{" "}
        <Link href="/signup" className="text-racing-red hover:underline">
          新規登録
        </Link>
      </p>
    </div>
  );
}
