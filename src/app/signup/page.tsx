"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    if (!agreed) {
      setError("利用規約とプライバシーポリシーに同意してください。");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username, display_name: displayName },
        emailRedirectTo: `${location.origin}/auth/callback`
      }
    });
    setLoading(false);
    if (error) return setError(error.message);
    if (data.session) {
      router.push("/cars");
      router.refresh();
    } else {
      setInfo(
        "確認メールを送信しました。メールのリンクから登録を完了してください。"
      );
    }
  }

  return (
    <div className="mx-auto max-w-md py-6">
      <h1 className="mb-2 text-2xl font-bold text-zinc-900">新規登録</h1>
      <p className="mb-6 text-sm text-zinc-500">
        走ログのアカウントを作成して、愛車とタイムを記録しよう。
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field
          label={
            <>
              ユーザー名{" "}
              <span className="text-zinc-400">(半角英数3〜24文字)</span>
            </>
          }
        >
          <input
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            pattern="[A-Za-z0-9_]{3,24}"
            className="input"
            placeholder="hashiro_taro"
          />
        </Field>
        <Field label="表示名">
          <input
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="input"
            placeholder="走太郎"
          />
        </Field>
        <Field label="メールアドレス">
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
            placeholder="you@example.com"
          />
        </Field>
        <Field
          label={
            <>
              パスワード <span className="text-zinc-400">(8文字以上)</span>
            </>
          }
        >
          <input
            required
            type="password"
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
          />
        </Field>
        <label className="flex items-start gap-2 text-xs text-zinc-600">
          <input
            type="checkbox"
            required
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5"
          />
          <span>利用規約とプライバシーポリシーに同意します</span>
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {info && <p className="text-sm text-emerald-600">{info}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-racing-red py-2.5 font-bold text-white hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? "登録中…" : "登録してはじめる"}
        </button>
      </form>
      <p className="mt-4 text-sm text-zinc-500">
        アカウントをお持ちですか？{" "}
        <Link href="/login" className="text-racing-red hover:underline">
          ログイン
        </Link>
      </p>
      <style jsx>{`
        .input {
          width: 100%;
          background: #ffffff;
          border: 1px solid #d4d4d8;
          border-radius: 6px;
          padding: 8px 10px;
          color: #18181b;
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
  children
}: {
  label: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm text-zinc-700">{label}</span>
      {children}
    </label>
  );
}
