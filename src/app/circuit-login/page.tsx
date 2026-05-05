"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function CircuitLoginPage() {
  return (
    <Suspense fallback={null}>
      <CircuitLoginForm />
    </Suspense>
  );
}

function CircuitLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) {
      setLoading(false);
      return setError(error.message);
    }
    // ログイン後、運営権限を持つサーキットがあるか確認
    const { data: staffRows } = await supabase
      .from("circuit_staff")
      .select("circuit_id, circuits(slug)")
      .eq("user_id", data.user!.id)
      .limit(1);
    setLoading(false);
    const slug = (staffRows?.[0] as any)?.circuits?.slug;
    if (slug) {
      router.push(`/circuits/${slug}/edit`);
    } else {
      setError("このアカウントには運営権限が登録されていません。走ログ運営にお問い合わせください。");
    }
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md py-6">
      <div
        className="mb-6 rounded-lg border p-4"
        style={{
          background: "linear-gradient(135deg, #fef3c7 0%, #fef9c3 100%)",
          borderColor: "#fcd34d"
        }}
      >
        <p className="text-xs font-semibold uppercase tracking-wider text-amber-800">
          CIRCUIT STAFF PORTAL
        </p>
        <p className="mt-1 text-sm text-zinc-800">
          サーキット公式アカウント専用のログインページです。一般ドライバーの方は{" "}
          <Link href="/login" className="underline">
            通常ログイン
          </Link>{" "}
          をご利用ください。
        </p>
      </div>
      <h1 className="mb-2 text-2xl font-bold text-zinc-900">
        サーキット運営者ログイン
      </h1>
      <p className="mb-6 text-sm text-zinc-500">
        登録された公式アカウントでログインすると、自施設のページ内容・イベント告知を編集できます。
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm text-zinc-700">
            運営者ID (メールアドレス)
          </span>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="staff@example.com"
            className="w-full rounded border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-100"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm text-zinc-700">パスワード</span>
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-100"
          />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-amber-600 py-2.5 font-bold text-white hover:bg-amber-700 disabled:opacity-50"
        >
          {loading ? "ログイン中…" : "運営者としてログイン"}
        </button>
      </form>
      <p className="mt-4 text-xs text-zinc-500">
        ※ 運営者アカウントは走ログ運営との提携締結後に発行されます。提携については{" "}
        <a
          href="mailto:partners@hashirolog.example"
          className="text-racing-red hover:underline"
        >
          partners@hashirolog.example
        </a>{" "}
        までお問い合わせください。
      </p>
    </div>
  );
}
